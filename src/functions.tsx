import axios from 'axios';

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
