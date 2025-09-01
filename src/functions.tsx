import * as React from 'react';
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';

import axios from 'axios';
import {VariantType, closeSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';

const api_main_url = 'https://ll2j8j5jmb.execute-api.ap-northeast-1.amazonaws.com';
const api_stage = 'default';
const baseURL = `${api_main_url}/${api_stage}`;

export async function fetchData(method: string, send_target: string, send_data: any = null, send_where: any = null) {
  const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  const data: any = { target: send_target };
  if (send_data) data['data'] = send_data;
  if (send_where) data['where'] = send_where;

  const queryString = buildQueryParams(data);
  const isGET = method.toUpperCase() === 'GET';

  const signPayload = {
    method,
    path: `/default/db_query`,
    body: isGET ? "" : data,
    query: isGET ? data : {},
  };

  // 取得簽名 headers
  const sigRes = await api.post('/aws_sign', signPayload);
  delete sigRes.data.signedHeaders.headers['Host'];
  // console.log(sigRes.data);

  // 與羽球排場系統API互動
  const finalUrl = isGET ? `${baseURL}/db_query?${queryString}` : `${baseURL}/db_query`;
  const res = await axios({
    method,
    url: finalUrl,
    headers: sigRes.data.signedHeaders.headers,
    data: isGET ? "" : data,
  });

  return res.data;
}

function buildQueryParams(obj: any, prefix = ''): string {
  const str: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const prefixedKey = prefix ? `${prefix}[${key}]` : key;

      if (value !== null && typeof value === 'object') {
        str.push(buildQueryParams(value, prefixedKey));
      } else {
        str.push(`${encodeURIComponent(prefixedKey)}=${encodeURIComponent(value)}`);
      }
    }
  }

  return str.join('&');
}

// 全域用推送訊息函數生成器
export function createEnqueueSnackbar(enqueueSnackbar:Function){
  return (
    msg: String, 
    variant: VariantType, // variant could be success, error, warning, info, or default
    do_function_name: String = '',
    do_function: Function = ()=>{},
  ) => {
    const autoHideDuration = 3000;
    const action = snackbarId => (
      <>
        {do_function_name && do_function && 
          <button onClick={() => { do_function() }} style={{marginRight:'1rem'}}>
            {do_function_name}
          </button>
        }
        <button onClick={() => { closeSnackbar(snackbarId) }}>
          <CloseIcon />
        </button>
      </>
    );

    enqueueSnackbar(msg, { 
      variant, autoHideDuration, action,
      anchorOrigin: { horizontal:'right', vertical:'top' },
    });
  }; 
}

// 回傳 textarea 內的球員名稱
export function getTextareaUserNames(text:string): string[]{
  let rows = text.trim().split("\n");
  let names = rows.map((row)=>{
    let word_s = row.split('.');
    let words = word_s.length>1 ? word_s.slice(1).join('.') : word_s[0];
    if(words.match('@')){
      let temp = words.split('@').slice(0,-1).join('@').trim();
      if(temp){
        words = temp;
      }else{
        words = words.split('@').slice(1).join('@');
      }
    }
    return words.trim();
  })
  .filter((item)=>{ return item.trim(); });

  return names;
}

export function formatSeconds(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = '';
  if (hours > 0) result += String(hours).padStart(2, '0') + ':';
  result += String(minutes).padStart(2, '0') + ':';
  result += String(seconds).padStart(2, '0') + '';

  return result;
}

export const middleEllipsis = (str, frontLen = 7, backLen = 0) => {
  if(!str){return ''}
  if (str.length <= frontLen + backLen) return str;
  return str.slice(0, frontLen) + "..." + (backLen?str.slice(-backLen):'');
};

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});