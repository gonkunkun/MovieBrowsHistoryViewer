ELEMENT.locale(ELEMENT.lang.ja)
var app = new Vue({
    el: '#app',
    data: {
        items: [],
        loading2: true,
        maxResults: 20
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
                let query = {
                    text: 'pornhub*view_video.php?viewkey',
                    maxResults: this.maxResults
                };
                chrome.history.search(query, (results) => {
                    this.items = null;
                    this.items = results;
                    this.updateImgUrl();              
                });
            });
        },
        updateImgUrl: function () {
            for (let i of this.items) {
                axios
                .get(i.url)
                .then(function(response) {
                    const delStr = "<meta property=\"og:image\" content=\"";
                    const str = `${delStr}http(s)?://ci.phncdn.com/videos/.*jpg`;
                    let url = response.data.match(str.replace(delStr,""));
                    Vue.set(i, "imgUrl", url[0]);
                    Vue.set(i, "lastVisitDateTime", this.unixTime2ymd(i.lastVisitTime));
                  }.bind(this)).catch(function(e) {
                    // console.error(e)
                })
            }
        }
    },
    created: function() {
        this.items = null;
        this.updateChromeHistory();
    },
    mounted: function() {
        // this.items = _.orderBy(this.items, "lastVisitTime", "desc");
    }
});