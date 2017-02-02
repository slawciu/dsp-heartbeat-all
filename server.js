const path = require('path')
const express = require('express')
const $ = require('jquery')
const window = $.window
const signalRClient = require('signalr-client')
const SignalRJS = require('signalrjs')
const FeedParser = require('feedparser')
const request = require('request')
const _ = require('underscore')


module.exports = {

  _setupRssWatch: function(feed) {
      var server = this;
      var feedParser = new FeedParser();
      try {
        request
          .get(feed)
          .on('error', function(err){
            console.log(err)
          })
          .pipe(feedParser);
      } catch (error) {
        console.log('Ups...:' + error)
      }

      feedParser.on('end', function(err){
        if (err){
          console.log(err);
        }
      });

      feedParser.on('error', function(error) {
        this.emit('end', error);
      });           

      feedParser.on('readable', function () {
        // This is where the action is!
        var stream = this; // `this` is `feedparser`, which is a stream
        var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
        var item;

        while (item = stream.read()) {
          var linkToBlog = item.meta.link;
          var blogTitle = item.meta.title;
          var feedUrl = item.meta.xmlUrl;
          if (linkToBlog === "/") {
            linkToBlog = "http://swistak35.com/";
          }

          if (server.blogInfo[linkToBlog] === undefined) {
            server.blogInfo[linkToBlog]={
              title: blogTitle,
              feedUrl: feedUrl,
              posts: [],
              lastPostDate: new Date(0),
              dspPosts: 0
            }
            console.log(linkToBlog+ ': '+ blogTitle);
          }
          var postOnList = server.blogInfo[linkToBlog].posts.filter(function(post){return post.link === item.link}).length > 0;

          if (!postOnList) {
            var isDspPost = item.categories.filter(function (category){
			                        return category.toLowerCase().search('ozna') > -1;
		                        }).length > 0;
            if (isDspPost) {
              server.blogInfo[linkToBlog].dspPosts++;
            }
            server.blogInfo[linkToBlog].posts.push({link: item.link, publishDate: item.date, categories: item.categories, title: item.title});
          }

          if (item.pubDate > server.blogInfo[linkToBlog].lastPostDate) {
            server.blogInfo[linkToBlog].lastPostDate = item.pubDate;
          }
        }
      });
  },

  app: function () {
    const signalR = SignalRJS();
    const app = express()
    const indexPath = path.join(__dirname, 'index.html')
    const publicPath = express.static(path.join(__dirname, 'public'))
    var server = this;

    var blogPosts = [];
    this.blogInfo = {};
    var lastUpdate = new Date();
    
    _.first(this._blogFeeds, this._blogFeeds.length).forEach(function(feed){
      setInterval(function(){
        this._setupRssWatch(feed);
      }.bind(this),10000);
    }.bind(this))

    signalR.hub('dspHub', {
      broadcast: function() {
        var updateDiff = new Date() - lastUpdate;
        
        console.log(updateDiff);
        if (updateDiff > 10000) {
          lastUpdate = new Date();
          this.clients.all.invoke('updateBlogPosts').withArgs([server.blogInfo]);
        } else {
          this.clients.all.invoke('idle').withArgs(['idle']);
        }
      },
      blogPostReceived: function() {
        this.clients.all.invoke('updateBlogPosts').withArgs([server.blogInfo]);
      }
    });

    signalR.on('CONNECTED',function(){
        console.log('connected');
    });

    app.use(signalR.createListener())
    app.use('/signalr/hubs', express.static(path.join(__dirname, 'signalr')))
    app.use('/public', publicPath)
    app.get('/', function (_, res) { res.sendFile(indexPath) })

    return app
  },
  _blogFeeds: [
			'http://0x00antdot.blogspot.com/feeds/posts/default',
			'http://adambac.com/feed.xml',
			'http://addictedtocreating.pl/feed/',
			'http://aragornziel.blogspot.com/feeds/posts/default',
			'http://arekbal.blogspot.com/feeds/posts/default',
			'http://bartmalanczuk.github.io/feed.xml',
			'http://blog.buczaj.com/feed/',
			'http://blog.chyla.org/rss',
			'http://blog.creyn.pl/feed/',
			'http://blog.degustudios.com/index.php/feed/',
			'http://blog.forigi.com/feed/',
			'http://blog.gonek.net/feed/',
			'http://blog.jhossa.net/feed/',
			'http://blog.kars7e.io/feed.xml',
			'http://blog.kokosa.net/syndication.axd',
			'http://blog.lantkowiak.pl/index.php/feed/',
			'http://blog.leszczynski.it/feed/',
			'http://blog.rakaz.pl/feed/',
			'http://blog.roobina.pl/?rss=516047c1-683c-4521-8ffd-143a0a546c85',
			'http://blog.stanaszek.pl/feed/',
			'http://blog.waldemarbira.pl/feed/',
			'http://blog.yellowmoleproductions.pl/feed/',
			'http://bnowakowski.pl/en/feed/',
			'http://brozanski.net/index.php/feed/',
			'http://cezary.mcwronka.com.hostingasp.pl/feed/',
			'http://charyzmatyczny-programista.blogspot.com/feeds/posts/default',
			'http://chmielowski.net/feed/',
			'http://cleancodestruggle.blogspot.com/feeds/posts/default',
			'http://coder-log.blogspot.com/feeds/posts/default',
			'http://codestorm.pl/feed/',
			'http://codinghabit.pl/feed/',
			'http://cojakodze.pl/feed/',
			'http://commitandrun.pl/feed.xml',
			'http://crynkowski.pl/feed/',
			'http://czekanski.info/feed/',
			'http://czesio-w-it.2ap.pl/feed/',
			'http://damiankedzior.com/feed/',
			'http://dev.mensfeld.pl/feed/',
			'http://devbochenek.pl/feed/',
			'http://devfirststeps.blog.pl/feed/',
			'http://donpiekarz.pl/feed.xml',
			'http://doriansobacki.pl/feed/',
			'http://dsp.katafrakt.me/feed.xml',
			'http://dspprojekt.blogspot.com/feeds/posts/default',
			'http://dyzur.blogspot.com/feeds/posts/default',
			'http://epascales.blogspot.com/feeds/posts/default',
			'http://feeds.feedburner.com/PassionateProgram',
			'http://findfriendsswift.blogspot.com/feeds/posts/default',
			'http://fogielpiotr.blogspot.com/feeds/posts/default',
			'http://foreverframe.pl/feed/',
			'http://ggajos.com/rss.xml',
			'http://halibuti.blogspot.com/feeds/posts/default',
			'http://hryniewski.net/syndication.axd',
			'http://immora.azurewebsites.net/feed/',
			'http://improsoft.blogspot.com/feeds/posts/default',
			'http://incodable.blogspot.com/feeds/posts/default',
			'http://ionicdsp.eu/?feed=rss2',
			'http://itcraftsman.pl/feed/',
			'http://it-michal-sitko.blogspot.com/feeds/posts/default',
			'http://jakubfalenczyk.com/feed/',
			'http://jakubskoczen.pl/feed/',
			'http://jaroslawstadnicki.pl/feed/',
			'http://jsdn.pl/feed/',
			'http://kduszynski.pl/feed/',
			'http://kkustra.blogspot.com/feeds/posts/default',
			'http://kodikable.pl/rss/',
			'http://koscielniak.me/post/index.xml',
			'http://koscielski.ninja/feed/',
			'http://kotprogramistyczny.pl/feed/',
			'http://kreskadev.azurewebsites.net/rss/',
			'http://krystianbrozek.pl/feed/',
			'http://krzyskowk.postach.io/feed.xml',
			'http://krzysztofabramowicz.com/feed/',
			'http://krzysztofzawistowski.azurewebsites.net/?feed=rss2',
			'http://langusblog.pl/index.php/feed/',
			'http://lazybitch.com/feed',
			'http://lion.net.pl/blog/feed.xml',
			'http://liveshare.azurewebsites.net/feed/',
			'http://localwire.pl/feed/',
			'http://macieklesiczka.github.io/rss.xml',
			'http://maciektalaska.github.io/atom.xml',
			'http://manisero.net/feed/',
			'http://marcindrobik.pl/Home/Rss',
			'http://marcinkowalczyk.pl/blog/feed/',
			'http://marcinkruszynski.blogspot.com/feeds/posts/default',
			'http://marcinszyszka.pl/feed/',
			'http://mariuszbartosik.com/feed/',
			'http://martanocon.com/?feed=rss2',
			'http://mateorobiapke.blogspot.com/feeds/posts/default',
			'http://matma.github.io/feed.xml',
			'http://mbork.pl/?action=rss',
			'http://mborowy.com/feed/',
			'http://mcupial.pl/feed/',
			'http://memforis.info/feed/',
			'http://metodprojekt.blogspot.com/feeds/posts/default',
			'http://michal.muskala.eu/feed.xml',
			'http://michalgellert.blogspot.com/feeds/posts/default',
			'http://michalogluszka.pl/feed/',
			'http://mieczyk.vilya.pl/feed/',
			'http://milena.mcwronka.com.hostingasp.pl/feed/',
			'http://mmalczewski.pl/index.php/feed/',
			'http://moje-zagwostki.blogspot.com/feeds/posts/default',
			'http://msnowak.pl/feed/',
			'http://mzieba.com/feed/',
			'http://namiekko.pl/feed/',
			'http://nicholaszyl.net/feed/',
			'http://nowas.pl/feed/',
			'http://oxbow.pl/feed/',
			'http://parkowanko.blogspot.com/feeds/posts/default',
			'http://paweldobrzanski.pl/feed',
			'http://pawelrzepinski.azurewebsites.net/feed/',
			'http://paweltymura.pl/feed/',
			'http://piatkosia.k4be.pl/wordpress/?feed=rss2',
			'http://piotrgankiewicz.com/feed/',
			'http://piotr-wandycz.pl/feed/',
			'http://plotzwi.com/feed/',
			'http://podziemiazamkul.blogspot.com/feeds/posts/default',
			'http://polak.azurewebsites.net/rss/',
			'http://programistka.net/feed/',
			'http://programuje.net/feed/',
			'http://przemek.ciacka.com/feed.xml',
			'http://pumiko.pl/feed.xml',
			'http://resumees.net/devblog/feed/',
			'http://rzeczybezinternetu.blogspot.com/feeds/posts/default',
			'http://sebcza.pl/feed/',
			'http://spine.angrybits.pl/?feed=rss2',
			'http://sprobujzmiany.blogspot.com/feeds/posts/default',
			'http://student.agh.edu.pl/~kefas/?feed=rss2',
			'http://sweetprogramming.com/feed/',
			'http://swistak35.com/feed.xml',
			'http://szumiato.pl/feed/',
			'http://takiarek.com/feed/',
			'http://t-code.pl/atom.xml',
			'http://terianil.blogspot.com/feeds/posts/default',
			'http://tokenbattle.blogspot.com/feeds/posts/default',
			'http://tomasz.dudziak.eu/feed/',
			'http://tomaszjarzynski.pl/feed/',
			'http://tomaszkacmajor.pl/index.php/feed/',
			'http://tomaszkorecki.com/feed/',
			'http://tomaszsokol.pl/feed/',
			'http://toomanyitprojects.azurewebsites.net/feed/',
			'http://tsovek.blogspot.com/feeds/posts/default',
			'http://twitop.azurewebsites.net/index.php/feed/',
			'http://wezewkodzie.blogspot.com/feeds/posts/default',
			'http://whitebear.com.pl/feed/',
			'http://www.andrzejdubaj.com/feed/',
			'http://www.arturnet.pl/feed/',
			'http://www.bodolsog.pl/devblog/feed/',
			'http://www.dedlajn.pl/feeds/posts/default',
			'http://www.devanarch.com/feed/',
			'http://www.diwebsity.com/feed/',
			'http://www.dobreprogramy.pl/djfoxer,Rss',
			'http://www.karolpysklo.pl/?feed=rss2',
			'http://www.marcinwojdak.pl/?feed=rss2',
			'http://www.md-techblog.net.pl/feed/',
			'http://www.mguzdek.pl/feed/',
			'http://www.namekdev.net/feed/',
			'http://www.owsiak.org/?feed=rss2',
			'http://www.przemyslawowsianik.net/feed/',
			'http://www.pyrzyk.net/feed/',
			'http://www.sebastiangruchacz.pl/feed/',
			'http://www.select-iot.pl/feed/',
			'http://www.sgierlowski.pl/posts/rssfeed',
			'http://www.straightouttacode.net/rss/',
			'http://www.wearesicc.com/feed/',
			'http://www.webatelier.io/blog.xml',
			'http://www.winiar.pl/blog/feed/',
			'http://zszywacz.azurewebsites.net/feed/',
			'http://zelazowy.github.io/feed.xml',
			'https://admincenterblog.wordpress.com/feed/',
			'https://alpac4blog.wordpress.com/feed/',
			'https://barloblog.wordpress.com/feed/',
			'https://beabest.wordpress.com/feed/',
			'https://bizon7nt.github.io/feed.xml',
			'https://blog.scooletz.com/feed/',
			'https://branegblog.wordpress.com/feed/',
			'https://brinf.wordpress.com/feed/',
			'https://bzaremba.wordpress.com/feed/',
			'https://chrisseroka.wordpress.com/feed/',
			'https://citygame2016.wordpress.com/feed/',
			'https://damianwojcikblog.wordpress.com/feed/',
			'https://devblog.dymel.pl/feed/',
			'https://devprzemm.wordpress.com/feed/',
			'https://dotnetcoder.wordpress.com/feed/',
			'https://duszekmestre.wordpress.com/feed/',
			'https://dziewczynazpytonem.wordpress.com/feed/',
			'https://fadwick.wordpress.com/feed/',
			'https://gettoknowthebob.wordpress.com/feed/',
			'https://github.com/piotrkowalczuk/charon/commits/master.atom',
			'https://ismenax.wordpress.com/feed/',
			'https://jendaapkatygodniowo.wordpress.com/feed/',
			'https://jporwol.wordpress.com/feed/',
			'https://kamilhawdziejuk.wordpress.com/feed/',
			'https://koniecznuda.wordpress.com/feed/',
			'https://krzysztofmorcinek.wordpress.com/feed/',
			'https://netgwg.wordpress.com/feed/',
			'https://odzeradokoderablog.wordpress.com/feed/',
			'https://onehundredoneblog.wordpress.com/feed/',
			'https://ourtownapp.wordpress.com/feed/',
			'https://pablitoblogblog.wordpress.com/feed/',
			'https://slaviannblog.wordpress.com/feed/',
			'https://stitzdev.wordpress.com/feed/',
			'https://tomaszprasolek.wordpress.com/feed/',
			'https://tomoitblog.wordpress.com/feed/',
			'https://uwagababaprogramuje.wordpress.com/feed/',
			'https://werpuc.wordpress.com/feed/',
			'https://zerojedynka.wordpress.com/feed/',
			'http://novakov.github.io/feed.xml',
			'http://adam.skobo.pl/?feed=rss2',
			'http://www.code-addict.pl/feed',
			'https://gotowalski.wordpress.com/feed/'
        ]
}
