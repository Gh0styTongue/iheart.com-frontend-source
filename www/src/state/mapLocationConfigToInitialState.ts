import { get, merge } from 'lodash-es';
import type { AppConfig } from 'widget/types';

export function makeAppConfigGetter(appConfig: AppConfig) {
  return (path: string) => get(appConfig, path);
}

/*
  SW 9/14/17

  This method is intentionally verbose! The explicit mapping below is a core part of its value to the application.

  In the interest of maintaining a single searchable mapping of web-config values onto state, this file should not be simplified.

  Developers should be able to do a project-wide grep for a particular appConfig value (e.g. sdks.comScore.threshold),
  and be directed to the associated line in this file.
*/

/*
  SW 9/19/17

  We are using lodash.get's dot-syntax here for searchability.
  This practice should not be used elsewhere in the codebase!
*/
export default function mapLocationConfigToInitialState(
  appConfig: AppConfig,
  lang: string,
  configOverride = {},
) {
  const config = makeAppConfigGetter(merge({}, appConfig, configOverride));

  return {
    ads: {
      adInterval: config('ads.adInterval'),
      adswizz: {
        companionZones: config('adswizzCompanionZones'),
        subdomain: config('adswizzSubdomain'),
        zoneId: config('adswizzZoneId'),
      },
      amazon: {
        pubId: config('sdks.amazon.pubId'),
        script: config('sdks.amazon.script'),
      },
      customAds: {
        enableCustomAds: config('EnableCustomAds'),
        partnerIds: config('ads.customAds.partnerIds'),
        tritonScript: config('ads.customAds.tritonScript'),
        type: config('ads.customAds.type'),
        url: config('ads.customAds.url'),
      },
      env: config('web_ad_env'),
      googleTag: {
        dfpInstanceId: config('ads.dfpInstanceId'),
      },
      indexExchange: {
        scripts: config('ads.headerBidding'),
      },
      lotame: {
        clientId: config('sdks.lotame.clientId'),
        enabled: config('sdks.lotame.enabled'),
        networkId: config('sdks.lotame.publisherId'),
        thirdPartyId: config('sdks.lotame.tp'),
        threshold: config('sdks.lotame.threshold'),
        legacyLotame: config('sdks.lotame.legacyLotame'),
      },
      rubicon: {
        script: config('sdks.rubicon.script'),
      },
      triton: {
        desktop: config('sdks.triton.desktop'),
        enabled: config('sdks.triton.enabled'),
        mobile: config('sdks.triton.mobile'),
        sid: config('sdks.triton.sid'),
        threshold: config('sdks.triton.threshold'),
      },
      ias: {
        enabled: config('sdks.ias.enabled'),
        library: config('sdks.ias.library'),
        anID: config('sdks.ias.anID'),
      },
    },
    analytics: {
      adobe: {
        account: config('sdks.adobeAnalytics.account'),
        dtmUrl: config('sdks.adobeAnalytics.dtmUrl'),
        enabled: config('sdks.adobeAnalytics.enabled'),
        secureTrackingServer: config(
          'sdks.adobeAnalytics.secureTrackingServer',
        ),
        threshold: config('sdks.adobeAnalytics.threshold'),
        trackingServer: config('sdks.adobeAnalytics.trackingServer'),
        visitorNamespace: config('sdks.adobeAnalytics.visitorNamespace'),
      },
      comScore: {
        customerId: config('sdks.comScore.customerId'),
        enabled: config('sdks.comScore.enabled'),
        publisherSecret: config('sdks.comScore.publisherSecret'),
        pageview_candidate_url: config('sdks.comScore.pageview_candidate_url'),
        threshold: config('sdks.comScore.threshold'),
      },
      googleAnalytics: {
        account: config('sdks.googleAnalytics.account'),
        domain: config('sdks.googleAnalytics.domain'),
        enabled: config('sdks.googleAnalytics.enabled'),
        threshold: config('sdks.googleAnalytics.threshold'),
      },
      permutive: {
        apiKey: config('sdks.permutive.apiKey'),
        projectId: config('sdks.permutive.projectId'),
      },
    },
    config: {
      braze: {
        appKey: config('sdks.appBoy.appKey'),
        baseUrl: config('sdks.appBoy.baseUrl'),
        enabled: config('sdks.appBoy.enabled'),
        threshold: config('sdks.appBoy.threshold'),
      },
      countryCode: config('countryCode'),
      facebookPixel: {
        enabled: config('sdks.facebook.pixelEnabled'),
        id: config('sdks.facebook.pixelId'),
      },
      gfkSensicSdk: {
        enabled: config('sdks.gfkSensicSdk.enabled'),
        script: config('sdks.gfkSensicSdk.script'),
      },
      googleCast: {
        appKey: config('sdks.googleCast.appKey'),
        enabled: config('sdks.googleCast.enabled'),
        threshold: config('sdks.googleCast.threshold'),
      },
      highlights: {
        mobile: {
          apiKey: config('sdks.highlights.mobile.apiKey'),
          placementId: config('sdks.highlights.mobile.placementId'),
          styleId: config('sdks.highlights.mobile.styleId'),
          height: config('sdks.highlights.mobile.height'),
        },
        desktop: {
          apiKey: config('sdks.highlights.desktop.apiKey'),
          placementId: config('sdks.highlights.desktop.placementId'),
          styleId: config('sdks.highlights.desktop.styleId'),
          height: config('sdks.highlights.desktop.height'),
        },
      },
      hostName: config('hostName'),
      markPlayedThreshold: config('markPlayedThreshold'),
      phoneNumbers: {
        callingCode: config('phoneNumbers.callingCode'),
        format: config('phoneNumbers.format'),
        digitRange: config('phoneNumbers.digitRange'),
      },
      piiRegulation: {
        dashboardLink: config('piiRegulation.dashboardLink'),
        enabled: config('piiRegulation.enabled'),
      },
      recaptcha: {
        enabled: config('sdks.recaptcha.enabled'),
        key: config('sdks.recaptcha.key'),
        threshold: config('sdks.recaptcha.threshold'),
      },
      recurly: {
        appKey: config('sdks.recurly.appKey'),
      },
      outbrainPixel: {
        enabled: config('sdks.outbrain.enabled'),
        id: config('sdks.outbrain.pixelId'),
      },
      stationSoftgate: config('stationSoftgate'),
      supportedCountries: config('supportedCountries'),
      terminalId: config('terminalId'),
      territoryCode: config('territoryCode'),
      urls: {
        api: config('api'),
        contentApi: config('radioEdit.contentApi'),
        graphQlApi: config('radioEdit.graphQlApi'),
        heroTheme: config('urls.heroTheme'),
        holidayHat: config('urls.holidayHat'),
        iglooUrl: config('urls.iglooUrl'),
        leadsApi: config('radioEdit.leadsApi'),
        playlistDirectoryMain: config('urls.playlistDirectoryMain'),
        radioEditMediaServer: config('urls.radioEditMediaServer'),
        site: config('web_site_url'),
        webGraphQlApi: config('radioEdit.webGraphQlApi'),
      },
      validation: {
        password: config('validation.password'),
      },
      regGateStationIds: config('regGateStationIds'),
    },
    configOverride,
    features: {
      flags: {
        allAccessPreview: config('featureFlags.allAccessPreview'),
        customRadio: config('featureFlags.customRadio'),
        darkModeAvailable: config('featureFlags.darkModeAvailable'),
        extrasNav: config('featureFlags.extrasNav'),
        forceABTest: config('featureFlags.forceABTest'),
        forYou: config('featureFlags.forYou'),
        freeUserMyPlaylist: config('featureFlags.freeUserMyPlaylist'),
        freeUserPlaylistCreation: config(
          'featureFlags.freeUserPlaylistCreation',
        ),
        gfkSensic: config('featureFlags.gfkSensic'),
        glassbox: config('featureFlags.glassbox'),
        graphQl: config('featureFlags.graphQl'),
        headerBidding: config('featureFlags.headerBidding'),
        highlightsSDK: config('featureFlags.highlightsSDK'),
        homepageEventsSection: config('featureFlags.homepageEventsSection'),
        homepageNewsSection: config('featureFlags.homepageNewsSection'),
        internationalPlaylistRadio: config(
          'featureFlags.internationalPlaylistRadio',
        ),
        liveRadio: config('featureFlags.liveRadio'),
        liveRadioCountryNav: config('featureFlags.liveRadioCountryNav'),
        longProfileId: config('featureFlags.longProfileId'),
        miniFooter: config('featureFlags.miniFooter'),
        newSearch: config('featureFlags.newSearch'),
        obfuscateUrls: config('featureFlags.obfuscateUrls'),
        onDemand: config('featureFlags.onDemand'),
        personalizedPlaylistRecs: config(
          'featureFlags.personalizedPlaylistRecs',
        ),
        pivotGeoEnabled: config('featureFlags.pivotGeoEnabled'),
        playlistRadio: config('featureFlags.playlistRadio'),
        playlistRadioAds: config('featureFlags.playlistRadioAds'),
        podcastTritonTokenEnabled: config(
          'featureFlags.podcastTritonTokenEnabled',
        ),
        podcastPreroll: config('featureFlags.podcastPreroll'),
        podcastRecs: config('featureFlags.podcastRecs'),
        recommendedPlaylistRecs: config('featureFlags.recommendedPlaylistRecs'),
        resetPasswordIncludeLogin: config(
          'featureFlags.resetPasswordIncludeLogin',
        ),
        showPodcastTranscriptions: config(
          'featureFlags.showPodcastTranscriptions',
        ),
        showWelcome: config('featureFlags.showWelcome'),
        socialShare: config('featureFlags.socialShare'),
        staticLogo: config('featureFlags.staticLogo'),
        stationSpecificRegGate: config('featureFlags.stationSpecificRegGate'),
        TEMPnoRefreshOnLogin: config('featureFlags.TEMPnoRefreshOnLogin'),
        useAmpTranscription: config('featureFlags.useAmpTranscription'),
        widgetArtistRadio: config('featureFlags.widgetArtistRadio'),
        widgetFavorites: config('featureFlags.widgetFavorites'),
        widgetLive: config('featureFlags.widgetLive'),
        widgetPlaylist: config('featureFlags.widgetPlaylist'),
        widgetPodcastEpisode: config('featureFlags.widgetPodcastEpisode'),
        widgetPodcastProfile: config('featureFlags.widgetPodcastProfile'),
        refreshAdOnFocus: config('featureFlags.refreshAdOnFocus'),
        liveLegalLinks: config('featureFlags.liveLegalLinks'),
      },
      registration: {
        emailUpdatesDefaultUnchecked: config(
          'registrationOptions.emailUpdatesDefaultUnchecked',
        ),
        genderAllowUnselected: config(
          'registrationOptions.genderAllowUnselected',
        ),
        genders: config('registrationOptions.genders'),
        oauths: config('registrationOptions.oauths'),
        showLoginInNav: config('registrationOptions.showLoginInNav'),
        usePostal: config('registrationOptions.usePostal'),
        zipKeyboard: config('registrationOptions.zipKeyboard'),
        zipRegex: config('registrationOptions.zipRegex'),
      },
    },
    links: {
      about: config('urls.about'),
      adChoices: config('urls.adChoices'),
      advertise: config('urls.advertise'),
      apps: config('urls.apps'),
      appsAuto: config('urls.appsAuto'),
      appsHome: config('urls.appsHome'),
      appsMobile:
        config(`urls.appsMobile.${lang}`) ?? config('urls.appsMobile.en'),
      appsWear: config('urls.appsWear'),
      blog: config('urls.blog'),
      brand: config('urls.brand'),
      content: config('urls.content'),
      contestRules: config('urls.contestrules'),
      contests: config('urls.contests'),
      customRadio: config('urls.customradio'),
      events: config('urls.events'),
      features: config('urls.features'),
      forYou: config('urls.forYou'),
      genres: config('urls.genres'),
      getTheAppLink: config('urls.getTheAppLink'),
      help: config('urls.help'),
      helpResettingPassword: config('urls.helpResettingPassword'),
      helpSkipLimit: config('urls.helpSkipLimit'),
      helpSocialSignIn: config('urls.helpSocialSignIn'),
      helpVerifyingEmail: config('urls.helpVerifyingEmail'),
      home: config('urls.home'),
      jobs: config('urls.jobs'),
      liveRadio: config('urls.liveradio'),
      myMusic: config('urls.mymusic'),
      myStations: config('urls.mystations'),
      news: config('urls.news'),
      ondemand: config('urls.ondemand'),
      optOut: config('urls.optout'),
      perfectFor: config('urls.perfectfor'),
      photos: config('urls.photos'),
      playlists: config('urls.playlists'),
      podcasts: config('urls.podcasts'),
      privacy: config('urls.privacy'),
      subscriptionoptions: config('urls.subscriptionoptions'),
      terms: config('urls.terms'),
      tlnkApps: config('urls.tlnkApps'),
      upgrade: config('urls.upgrade'),
      yourLibrary: config('urls.yourLibrary'),
    },
    live: {
      defaults: {
        cityId: config('defaultLiveCityId'),
        cityName: config('defaultLiveCityName'),
        marketName: config('defaultLiveMarketName'),
        stateAbbr: config('defaultLiveStateAbbr'),
        stateId: config('defaultLiveStateId'),
        stateName: config('defaultLiveStateName'),
      },
    },
    location: { defaultMarketId: config('defaultLiveMarketId') },
    social: {
      facebook: {
        appId: config('sdks.facebook.appId'),
        enabled: config('socials.facebook.enabled'),
        name: config('socials.facebook.name'),
        pages: config('sdks.facebook.pages'),
        threshold: config('sdks.facebook.threshold'),
      },
      fbAppId: config('sdks.facebook.appId'),
      fbPages: config('sdks.facebook.pages'),
      googlePlus: {
        appKey: config('sdks.googlePlus.appKey'),
        enabled: config('sdks.googlePlus.enabled'),
        threshold: config('sdks.googlePlus.threshold'),
      },
      instagram: {
        enabled: config('socials.instagram.enabled'),
        name: config('socials.instagram.name'),
      },
      tumblr: {
        enabled: config('socials.tumblr.enabled'),
        name: config('socials.tumblr.name'),
      },
      twitter: {
        enabled: config('socials.twitter.enabled'),
        name: config('socials.twitter.name'),
      },
      youtube: {
        enabled: config('socials.youtube.enabled'),
        name: config('socials.youtube.name'),
      },
    },
  };
}
