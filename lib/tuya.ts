import { createHmac, createHash } from 'crypto';

const CLIENT_ID = '8jnjppytd4ydnvmp8p3n';
const CLIENT_SECRET = '804bd5b5842a4178b1b606e5af4f7abc';
const DEVICE_ID = 'bf464c2ea06b72bd6anpur';
const BASE = 'https://openapi.tuyaeu.com';
const EMPTY_HASH = createHash('sha256').update('').digest('hex');

function hmac(secret: string, str: string) {
  return createHmac('sha256', secret).update(str).digest('hex').toUpperCase();
}
function nonce() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
function sts(method: string, path: string) {
  return `${method}\n${EMPTY_HASH}\n\n${path}`;
}

async function getToken(): Promise<string> {
  const t = Date.now().toString(), n = nonce(), path = '/v1.0/token?grant_type=1';
  const sign = hmac(CLIENT_SECRET, CLIENT_ID + t + n + sts('GET', path));
  const res = await fetch(BASE + path, {
    headers: { client_id: CLIENT_ID, sign, t, nonce: n, sign_method: 'HMAC-SHA256' }
  });
  const data = await res.json();
  if (!data.success) throw new Error('Token error: ' + (data.msg || JSON.stringify(data)));
  return data.result.access_token;
}

async function apiGet(token: string, path: string) {
  const t = Date.now().toString(), n = nonce();
  const sign = hmac(CLIENT_SECRET, CLIENT_ID + token + t + n + sts('GET', path));
  const res = await fetch(BASE + path, {
    headers: { client_id: CLIENT_ID, access_token: token, sign, t, nonce: n, sign_method: 'HMAC-SHA256' }
  });
  return res.json();
}

function g(props: any[], code: string) {
  const p = props.find(x => x.code === code);
  return p != null ? p.value : null;
}

export async function fetchStationData() {
  const token = await getToken();
  const data = await apiGet(token, `/v2.0/cloud/thing/${DEVICE_ID}/shadow/properties`);
  if (!data.success) throw new Error(data.msg || 'Tuya API error');
  const props: any[] = Array.isArray(data.result) ? data.result : (data.result?.properties || []);

  const temp   = g(props, 'outdoor_temperature');
  const tempIn = g(props, 'indoor_temperature');
  const hum    = g(props, 'outdoor_humidity');
  const humIn  = g(props, 'indoor_humidity');
  const pres   = g(props, 'indoor_pressure');
  const ws     = g(props, 'wind_speed');
  const gust   = g(props, 'wind_gust');
  const wd     = g(props, 'wind_direction');
  const rain   = g(props, 'rainfall');
  const uv     = g(props, 'uvi');
  const lux    = g(props, 'light_intensity');

  return {
    temp_out:     temp   != null ? +(temp / 10).toFixed(1)   : null,
    temp_in:      tempIn != null ? +(tempIn / 10).toFixed(1) : null,
    humidity_out: hum    != null ? hum                       : null,
    humidity_in:  humIn  != null ? humIn                     : null,
    pressure:     pres   != null ? +(pres / 100 + 42).toFixed(1)  : null,
    wind_speed:   ws     != null ? +(ws / 10).toFixed(1)     : null,
    wind_gust:    gust   != null ? +(gust / 10).toFixed(1)   : null,
    wind_dir:     wd     != null ? wd                        : null,
    rainfall:     rain   != null ? +(rain / 10).toFixed(1)   : null,
    uv_index:     uv     != null ? uv                        : null,
    light_klux:   lux    != null ? +(lux / 10).toFixed(1)    : null,
  };
}
