ELEMENT.locale(ELEMENT.lang.ja);
let app = new Vue({
  el: "#app",
  data: {
    activeIndex: "1",

    // サイト毎のデータを保持するリスト
    items: {},
    loading: true,
    // htmlに表示するためのリスト(履歴)
    displayItems: [],
    // htmlに表示するためのリスト(お気に入り)
    displayFavorites: [],
    favNum: 0,
    maxResults: 20,
    startTime: "",
    // 動画情報を取得するサイト名と正規表現定義リスト
    urlMachingList: [
      {
        // サイト名
        name: "pornhub",
        // chrome履歴から取得するURL名
        site: "pornhub*view_video.php?viewkey",
        // 取得する画像のURLパターン
        str: /\<meta property=\"og\:image\" content=\"http(s)?:\/\/.*jpg/,
        delStr: '<meta property="og:image" content="',
        // 表示する履歴のURLパターン
        matchUrl: /.*/
      },
      {
        name: "avgle",
        site: "avgle.com*/video/",
        str: /content=\"http(s)?:\/\/.*jpg/,
        delStr: 'content="',
        matchUrl: /.*avgle.com\/video\/.*/
      },
      {
        name: "xvideos",
        site: "xvideos*/video",
        str: /html5player.setThumbUrl169\(\'.*jpg/,
        delStr: "html5player.setThumbUrl169('",
        matchUrl: /.*/
      },
      {
        name: "analdin",
        site: "www.analdin.com*/videos/",
        str: /href=\"https:\/\/www.analdin.com\/get_file\/0\/.*jpg\//,
        delStr: 'href="',
        matchUrl: /.*www.analdin.com\/videos\/.*/
      }
    ]
  },
  watch: {
    items: function(val, oldVal) {
      this.displayItems = [];
      for (let i in val) {
        // console.log(i);
        for (let j in val[i]) {
          // 検索条件設定
          val[i][j].site = i;
          this.displayItems.push(val[i][j]);
        }
      }
      this.displayItems = _.orderBy(this.displayItems, "lastVisitTime", "desc");
    },
    displayFavorites: function(val, oldval) {
      this.favNum = this.displayFavorites.length;
      // console.log(this.favNum);
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      this.activeIndex = key;
    },
    unixTime2ymd: function(intTime) {
      var d = new Date(intTime);
      var year = d.getFullYear();
      var d = new Date(intTime);
      var y = new Date(intTime * 1000);
      var year = y.getFullYear();
      var month = d.getMonth() + 1;
      var day = d.getDate();
      var hour = ("0" + d.getHours()).slice(-2);
      var min = ("0" + d.getMinutes()).slice(-2);
      var sec = ("0" + d.getSeconds()).slice(-2);

      return month + "/" + day + " " + hour + ":" + min + ":" + sec;
    },
    updateChromeHistory: function() {
      let dt = new Date();
      this.startTime = dt.setMonth(dt.getMonth() - 1);
      document.addEventListener("DOMContentLoaded", () => {
        // 定義されているサイト分ループ
        for (let list of this.urlMachingList) {
          let name = list.name;
          let delStr = list.delStr;
          let str = list.str;
          let site = list.site;
          let matchUrl = list.matchUrl;
          let query = {
            text: site,
            maxResults: this.maxResults,
            startTime: this.startTime
          };
          chrome.history.search(query, results => {
            // console.log(results);
            let res = [];
            // サイトの検索結果に関する履歴を排除
            for (let i of results) {
              if (i.url.match(matchUrl) != null) {
                res.push(i);
              }
            }
            // console.log(this.items);
            Vue.set(this.items, name, res);
            this.updateImgUrl(this.items[name], delStr, str);
          });
        }
      });
    },
    updateImgUrl: function(items, delStr, str) {
      for (let i of items) {
        axios
          .get(i.url)
          .then(
            function(response) {
              // console.log(response);
              let url = response.data.match(str);
              url[0] = url[0].replace(delStr, "");
              // console.log(url[0]);
              Vue.set(i, "imgUrl", url[0]);
              Vue.set(
                i,
                "lastVisitDateTime",
                this.unixTime2ymd(i.lastVisitTime)
              );
              Vue.set(i, "isShowBtn", true);
              this.loading = false;
            }.bind(this)
          )
          .catch(function(e) {
            // console.error(e)
          });
      }
    },
    addFavorite: function(index) {
      // 重複フラグ
      let isDupli = false;
      this.displayItems[index].isShowBtn = false;
      // 重複チェック
      for (fav in this.displayFavorites) {
        if (this.displayFavorites[fav].url === this.displayItems[index].url) {
          // console.log("重複発見");
          Vue.set(this.displayFavorites[fav], "lastVisitTime", Date.now());
          Vue.set(
            this.displayFavorites[fav],
            "lastVisitDateTime",
            this.unixTime2ymd(Date.now())
          );
          isDupli = true;
        }
      }
      if (isDupli === false) {
        // 重複がなければお気に入りに追加
        newIndex = this.displayFavorites.push(
          JSON.parse(JSON.stringify(this.displayItems[index]))
        );
        Vue.set(
          this.displayFavorites[newIndex - 1],
          "lastVisitTime",
          Date.now()
        );
        Vue.set(
          this.displayFavorites[newIndex - 1],
          "lastVisitDateTime",
          this.unixTime2ymd(Date.now())
        );
      }

      this.displayFavorites = _.orderBy(
        this.displayFavorites,
        "lastVisitTime",
        "desc"
      );
      chrome.storage.local.set({ favorites: this.displayFavorites }, () => {});
    },
    deleteFavorite: function(index) {
      // console.log(index);
      this.displayFavorites.splice(index, 1);
      chrome.storage.local.set(
        { favorites: this.displayFavorites },
        function() {}
      );
    },
    updateFavorite: function() {
      chrome.storage.local.get("favorites", result => {
        for (let i of result.favorites) {
          this.displayFavorites.push(JSON.parse(JSON.stringify(i)));
        }
        // console.log(this.displayFavorites);
      });
    },
    createRequest: function(item, type) {
      let data = item;
      data.type = type;
      xhr = new XMLHttpRequest();
      var url = "http://ec2-18-214-225-174.compute-1.amazonaws.com:5044";
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/json");
      let jData = JSON.stringify(data);
      xhr.send(jData);
      // 対象のページを開く
      if (type === "addFavorite") {
        return;
      }
      setTimeout(() => {
        open(item.url, "_blank");
      }, 200);
    }
  },
  created: function() {
    this.updateFavorite();
    this.updateChromeHistory();
  },
  mounted: function() {
    document.onscroll = e => {
      this.position =
        document.documentElement.scrollTop || document.body.scrollTop;
    };
  }
});
