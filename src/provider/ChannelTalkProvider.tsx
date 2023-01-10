import { useEffect } from 'react';

import Script from 'next/script';
import { useRouter } from 'next/router';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';

import { ACCESS_USER } from '@constants/localStorage';

import type { ChannelTalkBootOption } from '@typings/common';

function ChannelTalkProvider() {
  const router = useRouter();

  useEffect(() => {
    ChannelTalk.hideMessenger();
  }, [router.pathname]);

  useEffect(() => {
    const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);
    const option: ChannelTalkBootOption = {
      hideChannelButtonOnBoot: true,
      pluginKey: process.env.CHANNEL_TALK_PLUGIN_KEY,
      trackDefaultEvent: false,
      mobileMessengerMode: 'iframe',
      zIndex: 11
    };

    if (accessUser?.userId) {
      option.memberId = accessUser.userId;
    }

    ChannelTalk.boot(option, (error) => {
      if (!error && accessUser) {
        const { email, userName, gender, age } = accessUser;
        let newGender = gender === 'M' ? '남성' : '여성';
        if (gender !== 'M' && gender !== 'F') newGender = 'NONE';
        const profile = {
          email,
          name: userName,
          gender: newGender,
          age: age ? `${age}세` : undefined
        };
        const profileOnce = {
          email,
          name: userName
        };
        ChannelTalk.updateUser({
          language: 'ko',
          profile,
          profileOnce
        });
      }
    });
  }, []);

  return (
    <Script
      id="channel-io"
      dangerouslySetInnerHTML={{
        __html:
          '(function(){var w=window;if(w.ChannelIO){return(window.console.error||window.console.log||function(){})("ChannelIO script included twice.")}var ch=function(){ch.c(arguments)};ch.q=[];ch.c=function(args){ch.q.push(args)};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";s.charset="UTF-8";var x=document.getElementsByTagName("script")[0];x.parentNode.insertBefore(s,x)}if(document.readyState==="complete"){l()}else if(window.attachEvent){window.attachEvent("onload",l)}else{window.addEventListener("DOMContentLoaded",l,false);window.addEventListener("load",l,false)}})();'
      }}
    />
  );
}

export default ChannelTalkProvider;
