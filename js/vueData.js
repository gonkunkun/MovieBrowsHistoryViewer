ELEMENT.locale(ELEMENT.lang.ja)
let app = new Vue({
    el: '#app',
    data: {
        items: [],
        maxResults: 20
    },
    methods: {
        unixTime2ymd: function(intTime) {
            let d = new Date( intTime );
            let year  = d.getFullYear();
            let d = new Date( intTime );
            let y = new Date( intTime * 1000 );
            let year  = y.getFullYear();
            let month = d.getMonth() + 1;
            let day  = d.getDate();
            let hour = ( '0' + d.getHours() ).slice(-2);
            let min  = ( '0' + d.getMinutes() ).slice(-2);
            let sec   = ( '0' + d.getSeconds() ).slice(-2);
        
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