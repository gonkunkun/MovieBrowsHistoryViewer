ELEMENT.locale(ELEMENT.lang.ja)
let app = new Vue({
    el: '#app',
    data: {
        activeIndex: '1',
        // サイト毎のデータを保持するリスト
        items: {},
        loading: true,
        // htmlに表示するためのリスト(履歴)
        displayItems: [],
        // htmlに表示するためのリスト(お気に入り)
        displayFavorites: [
            {
                imgUrl: "https://di.phncdn.com/videos/201902/05/205899871/original/(m=eaAaGwObaaaa)(mh=ILjQ_1rT5TMkQZSA)14.jpg",
                lastVisitDateTime: "3/5 02:47:10",
                lastVisitTime: 1551721630840.282,
                title: "C25_hasega_0001 - Pornhub.com",
                url: "https://jp.pornhub.com/view_video.php?viewkey=ph5c5947c7069f8&t=0&utm_source=masutabe.info&utm_medium=embed&utm_campaign=embed-html5",
            },
            {
                imgUrl: "https://di.phncdn.com/videos/201902/05/205899871/original/(m=eaAaGwObaaaa)(mh=ILjQ_1rT5TMkQZSA)14.jpg",
                lastVisitDateTime: "3/5 02:47:10",
                lastVisitTime: 1551721630840.282,
                title: "C25_hasega_0001 - Pornhub.com",
                url: "https://jp.pornhub.com/view_video.php?viewkey=ph5c5947c7069f8&t=0&utm_source=masutabe.info&utm_medium=embed&utm_campaign=embed-html5",
            },
            {
                imgUrl: "https://di.phncdn.com/videos/201902/05/205899871/original/(m=eaAaGwObaaaa)(mh=ILjQ_1rT5TMkQZSA)14.jpg",
                lastVisitDateTime: "3/5 02:47:10",
                lastVisitTime: 1551721630840.282,
                title: "C25_hasega_0001 - Pornhub.com",
                url: "https://jp.pornhub.com/view_video.php?viewkey=ph5c5947c7069f8&t=0&utm_source=masutabe.info&utm_medium=embed&utm_campaign=embed-html5",
            }
        ],
        maxResults: 50,
        startTime: "",
        // 動画情報を取得するサイト名と正規表現定義リスト
        urlMachingList: [
            {
                // サイト名
                name: 'pornhub',
                // chrome履歴から取得するURL名
                site: 'pornhub*view_video.php?viewkey',
                // 取得する画像のURLパターン
                str: /\<meta property=\"og\:image\" content=\"http(s)?:\/\/.*jpg/,
                delStr: "<meta property=\"og:image\" content=\"",
                // 表示する履歴のURLパターン
                matchUrl: /.*/
            },
            {
                name: 'xvideos',
                site: 'xvideos*/video',
                str: /html5player.setThumbUrl169\(\'.*jpg/,
                delStr: "html5player.setThumbUrl169\(\'",
                matchUrl: /.*/
            },
            {
                name: 'avgle',
                site: 'avgle.com*/video/',
                str: /content=\"http(s)?:\/\/.*jpg/,
                delStr: "content=\"",
                matchUrl: /.*avgle.com\/video\/.*/
            },
            {
                name: 'analdin',
                site: 'www.analdin.com*/videos/',
                str: /href=\"https:\/\/www.analdin.com\/get_file\/0\/.*jpg\//,
                delStr: "href=\"",
                matchUrl: /.*www.analdin.com\/videos\/.*/
            }
        ]
    },
    watch: {
        items: function (val, oldVal) {
            this.displayItems = [];
            for (let i in val) {
                for (let j in val[i]) {
                    // 検索条件設定
                    
                    this.displayItems.push(val[i][j]);
                }
            }
            this.displayItems = _.orderBy(this.displayItems, "lastVisitTime", "desc");
            console.log(this.displayItems);
        }
    },
    methods: {
        handleSelect(key, keyPath) {
            this.activeIndex = key; 
        },
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
            let dt = new Date();
            this.startTime = dt.setMonth(dt.getMonth() - 1);
            document.addEventListener('DOMContentLoaded', () => {
                // 定義されているサイト分ループ
                for (let list of this.urlMachingList) {
                    let name = list.name
                    let delStr = list.delStr;
                    let str = list.str;
                    let site = list.site;
                    let matchUrl = list.matchUrl;
                    let query = {
                        text: site,
                        maxResults: this.maxResults,
                        startTime: this.startTime
                    };
                    chrome.history.search(query, (results) => {
                        console.log(results);
                        let res = [];
                        // サイトの検索結果に関する履歴を排除
                        for (let i of results) {
                            if (i.url.match(matchUrl) != null ){
                                res.push(i);
                            }
                        }
                        console.log(this.items);
                        Vue.set(this.items, name, res);
                        this.updateImgUrl(this.items[name], delStr, str);              
                    });
                }
            });
        },
        updateImgUrl: function (items, delStr, str) {
            for (let i of items) {
                axios
                .get(i.url)
                .then(function(response) {
                    console.log(response);
                    let url = response.data.match(str);
                    url[0] = url[0].replace(delStr,"");
                    console.log(url[0]);
                    Vue.set(i, "imgUrl", url[0]);
                    Vue.set(i, "lastVisitDateTime", this.unixTime2ymd(i.lastVisitTime));
                    this.loading = false;
                }.bind(this)).catch(function(e) {
                    // console.error(e)
                })
            }
        },
        deleteFavorite: function(index) {
            this.displayFavorites.splice(index, 1);
            // TODO お気に入り更新機能入れる
        }
    },
    created: function() {
        this.updateChromeHistory();
    },
    mounted: function() {
    }
});
