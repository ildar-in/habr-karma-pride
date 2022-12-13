window.addEventListener('load', e => {

    var oldLoc = null
    var newLoc = null

    var checker = setInterval(_ => {
        if (oldLoc !== newLoc && document.location.toString().endsWith('votes-karma/')) {
            run()
        }
        oldLoc = newLoc
        newLoc = document.URL
    }, 300)

    function run() {

        var start = 'https://habr.com/ru/users/'
        var end = '/votes-karma/'
        var allText = document.location.toString()
        var username = allText.substring(start.length, allText.length - end.length)

        var userHtml = document.getElementsByClassName('tm-user-card__info')[0]
        var statsHtml = document.createElement('div')
        userHtml.append(statsHtml)

        var statsHtmlKarma = document.createElement('div')
        var statsHtmlKarmaComment = document.createElement('div')
        var statsHtmlKarmaPosts = document.createElement('div')
        var statsHtmlKarmaSelf = document.createElement('div')

        statsHtml.append(document.createElement('hr'))
        statsHtml.append(statsHtmlKarmaSelf)
        statsHtml.append(document.createElement('hr'))
        statsHtml.append(statsHtmlKarma)
        statsHtml.append(document.createElement('hr'))
        statsHtml.append(statsHtmlKarmaComment)
        statsHtml.append(document.createElement('hr'))
        statsHtml.append(statsHtmlKarmaPosts)

        statsHtmlKarma.innerText = statsHtmlKarmaComment.innerText = statsHtmlKarmaPosts.innerText = 'Загрузка...'

        loadStatSelf((a, p, m) => {
            var pp = ((p / a.length) * 100).toPrecision(2) + '%'
            var mp = ((m / a.length) * 100).toPrecision(2) + '%'
            statsHtmlKarmaSelf.innerText = 'Всего получил: ' + a.length + '\nПлюсов: ' + p + ' (' + pp + ')\nМинусов: ' + m + ' (' + mp + ')'
        }, (i, j) => {
            statsHtmlKarmaSelf.innerText = 'Загружено ' + i + '/' + j
        })

        loadStats((a, p, m) => {
            var pp = ((p / a) * 100).toPrecision(2) + '%'
            var mp = ((m / a) * 100).toPrecision(2) + '%'
            statsHtmlKarma.innerText = 'Всего поставил в профиль: ' + a + '\nПлюсов: ' + p + ' (' + pp + ')\nМинусов: ' + m + ' (' + mp + ')'
        })

        loadStatComments((a, p, m, n) => {
            var pp = ((p / a.length) * 100).toPrecision(2) + '%'
            var mp = ((m / a.length) * 100).toPrecision(2) + '%'
            var np = ((n / a.length) * 100).toPrecision(2) + '%'
            statsHtmlKarmaComment.innerText = 'Всего поставил за комментарии: ' + a.length + '\nПлюсов: ' + p + ' (' + pp + ')\nМинусов: ' + m + ' (' + mp + ')\nНичего: ' + n + ' (' + np + ')'
        }, (i, j) => {
            statsHtmlKarmaComment.innerText = 'Загружено ' + i + '/' + j
        })

        loadStatPosts((a, p, m, n) => {
            var pp = ((p / a.length) * 100).toPrecision(2) + '%'
            var mp = ((m / a.length) * 100).toPrecision(2) + '%'
            var np = ((n / a.length) * 100).toPrecision(2) + '%'
            statsHtmlKarmaPosts.innerText = 'Всего поставил за посты: ' + a.length + '\nПлюсов: ' + p + ' (' + pp + ')\nМинусов: ' + m + ' (' + mp + ')\nНичего: ' + n + ' (' + np + ')'
        }, (i, j) => {
            statsHtmlKarmaPosts.innerText = 'Загружено ' + i + '/' + j
        })


        //-------------------------------------------------------

        function loadStats(onLoaded) {
            fetch('https://habr.com/kek/v2/users/' + username + '/votes_from?page=1&perPage=100&value=').then(r => r.text()).then(b => {
                var d = JSON.parse(b); var a = 0, p = 0, m = 0; d.votes.forEach(v => { a++; if (v.value > 0) p++; if (v.value < 0) m++; });
                onLoaded(a, p, m);
            })
        }

        function loadStatComments(onLoaded, onLoading) {
            var a = [], p = 0, m = 0, n = 0;
            function getcom(r) {
                fetch('https://habr.com/kek/v2/users/' + username + '/comments/votes?page=' + r + '&perPage=15&value=').then(r => r.text()).then(b => {
                    var d = JSON.parse(b);
                    Object.getOwnPropertyNames(d.postCommentRefs).forEach(k => a.push(d.postCommentRefs[k]));
                    onLoading(r, d.pagesCount)
                    if (r < d.pagesCount) { getcom(++r); } else {
                        console.log('Пустые комменты',a.filter(c => c.vote.value===0))
                        a.forEach(c => {
                            if (c.vote.value > 0) { p++; } else
                                if (c.vote.value < 0) { m++; } else {
                                    n++;
                                    console.log(c)
                                }
                        });
                        onLoaded(a, p, m, n)
                    }
                })
            }
            getcom(1)
        }

        function loadStatPosts(onLoaded, onLoading) {
            var a = [], p = 0, m = 0, n = 0;
            function getcom(r) {
                fetch('https://habr.com/kek/v2/users/' + username + '/posts/votes?page=' + r + '&perPage=20&value=').then(r => r.text()).then(b => {
                    var d = JSON.parse(b);
                    Object.getOwnPropertyNames(d.articleRefs).forEach(k => a.push(d.articleRefs[k]));
                    onLoading(r, d.pagesCount)
                    if (r < d.pagesCount) { getcom(++r); } else {
                        console.log('Пустые посты', a.filter(c => c.relatedData.vote.value === 0))

                        a.forEach(c => {
                            try {
                                if (c.relatedData.vote.value > 0) { p++; } else
                                    if (c.relatedData.vote.value < 0) { m++; } else { n++; }
                            } catch (err) {
                                console.error(err, c)
                            }
                        });
                        onLoaded(a, p, m, n)
                    }
                })
            }
            getcom(1)
        }

        function loadStatSelf(onLoaded, onLoading) {
            var a = [], p = 0, m = 0;
            function getcom(r) {
                fetch('https://habr.com/kek/v2/users/' + username + '/votes_for?page=' + r + '&perPage=20&value=').then(r => r.text()).then(b => {
                    var d = JSON.parse(b);
                    d.votes.forEach(k => a.push(k));
                    onLoading(r, d.pagesCount)
                    if (r < d.pagesCount) { getcom(++r); } else {
                        console.log(a)

                        a.forEach(c => {
                            try {
                                if (c.value > 0) p++;
                                if (c.value < 0) m++;
                            } catch (err) {
                                console.error(err, c)
                            }

                        });
                        onLoaded(a, p, m)
                    }
                })
            }
            getcom(1)
        }

    }

})