ELEMENT.locale(ELEMENT.lang.ja)
let app = new Vue({
    el: '#app',
    data: {
        // サイト毎のデータを保持するリスト
        items: {},
        // htmlに表示するためのリスト
        displayItems: [],
        maxResults: 20,
        // 動画情報を取得するサイト名と正規表現定義リスト
        urlMachingList: [{
            name: 'pornhub',
            site: 'pornhub*view_video.php?viewkey',
            str: /\<meta property=\"og\:image\" content=\"http(s)?:\/\/.*jpg/,
            delStr: "<meta property=\"og:image\" content=\""
        },
        {
            name: 'xvideos',
            site: 'xvideos*/video',
            str: /html5player.setThumbUrl169\(\'.*jpg/,
            delStr: "html5player.setThumbUrl169\(\'"
        }]
    },
    watch: {
        items: function (val, oldVal) {
            this.displayItems = [];
            for (let i in val) {
                for (let j in val[i]) {
                    this.displayItems.push(val[i][j]);
                }
            }
            this.displayItems = _.orderBy(this.displayItems, "lastVisitTime", "desc");
        },
    },
    methods: {
        unixTime2ymd: function(intTime) {
            var d = new Date( intTime );
            var year  = d.getFullYear();
            var d = new Date( intTime );
            var y = new Date( intTime * 1000 );
            var year  = y.getFullYear();
            var month = d.getMonth() + 1;
            var day  = d.getDate();
            var hour = ( '0' + d.getHours() ).slice(-2);
            var min  = ( '0' + d.getMinutes() ).slice(-2);
            var sec   = ( '0' + d.getSeconds() ).slice(-2);
        
            return( month + '/' + day + ' ' + hour + ':' + min + ':' + sec );
        },
        updateChromeHistory: function () {
            document.addEventListener('DOMContentLoaded', () => {
                // 定義されているサイト分ループ
                for (let list of this.urlMachingList) {
                    let name = list.name
                    let delStr = list.delStr;
                    let str = list.str;
                    let site = list.site;
                    let query = {
                        text: site,
                        maxResults: this.maxResults
                    };
                    chrome.history.search(query, (results) => {
                        Vue.set(this.items, name, results);
                        this.updateImgUrl(this.items[name], delStr, str);              
                    });
                }
            });
        },
        updateImgUrl: function (items, delStr, str) {
            console.log(items);
            for (let i of items) {
                axios
                .get(i.url)
                .then(function(response) {
                    let url = response.data.match(str);
                    url[0] = url[0].replace(delStr,"");
                    Vue.set(i, "imgUrl", url[0]);
                    Vue.set(i, "lastVisitDateTime", this.unixTime2ymd(i.lastVisitTime));
                  }.bind(this)).catch(function(e) {
                    // console.error(e)
                })
            }
        }
    },
    created: function() {
        this.updateChromeHistory();
    },
    mounted: function() {
    }
});