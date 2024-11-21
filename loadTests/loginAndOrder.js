import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
    cloud: {
        distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
        apm: [],
    },
    thresholds: {},
    scenarios: {
        Scenario_1: {
            executor: 'ramping-vus',
            gracefulStop: '30s',
            stages: [
                { target: 5, duration: '30s' },
                { target: 15, duration: '1m' },
                { target: 10, duration: '30s' },
                { target: 0, duration: '30s' },
            ],
            gracefulRampDown: '30s',
            exec: 'scenario_1',
        },
    },
}

export function scenario_1() {
    let response

    group('Login and order - https://pizza.keifferd.click/', function () {
        // Get homepage
        response = http.get('https://pizza.keifferd.click/', {
            headers: {
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                'cache-control': 'max-age=0',
                'if-modified-since': 'Thu, 31 Oct 2024 22:41:07 GMT',
                'if-none-match': '"563915d021c7a9d079d4904478a56a87"',
                priority: 'u=0, i',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
            },
        })
        sleep(5)


        const vars = {}
        // Login
        response = http.put(
            'https://pizza-service.keifferd.click/api/auth',
            '{"email":"d@jwt.com","password":"diner"}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                    'content-type': 'application/json',
                    origin: 'https://pizza.keifferd.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                },
            }
        )
        if(!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
            console.log(response.body);
            fail('Login was *not* 200');
        }
        vars['token1'] = jsonpath.query(response.json(), '$.token')[0];
        sleep(15)

        // Get menu
        response = http.get('https://pizza-service.keifferd.click/api/order/menu', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                'content-type': 'application/json',
                authorization: `Bearer ${vars['token1']}`,
                origin: 'https://pizza.keifferd.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })

        // Get stores
        response = http.get('https://pizza-service.keifferd.click/api/franchise', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                'content-type': 'application/json',
                authorization: `Bearer ${vars['token1']}`,
                origin: 'https://pizza.keifferd.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })
        sleep(13.3)

        // Order a pizza
        response = http.post(
            'https://pizza-service.keifferd.click/api/order',
            '{"items":[{"menuId":3,"description":"Margarita","price":0.0042}],"storeId":"1","franchiseId":1}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                    'content-type': 'application/json',
                    authorization: `Bearer ${vars['token1']}`,
                    origin: 'https://pizza.keifferd.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                },
            }
        )
        if(!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
            console.log('Order pizza failed');
            console.log(response.body);
        }
        vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0];
        sleep(4.9)

        // Verify jwt
        response = http.post(
            'https://pizza-factory.cs329.click/api/order/verify',
            `{"jwt":"${vars['jwt']}"}`,
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
                    'content-type': 'application/json',
                    authorization: `Bearer ${vars['token1']}`,
                    origin: 'https://pizza.keifferd.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                },
            }
        )
        if(!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
            console.log('Verify pizza failed');
            console.log(response.body);
        }
    })
}