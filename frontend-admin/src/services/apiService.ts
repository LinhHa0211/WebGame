import { getAccessToken } from "@/lib/actions";

const apiService = {
    get: async function (url: string): Promise<any> {
        console.log('get', url);
        const token = await getAccessToken();

        return new Promise((resolve, reject) => {
            fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then((json) => {
                    console.log('Response:', json);
                    resolve(json);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    post: async function(url: string, data: any): Promise<any> {
        console.log('post', url, data);
        const token = await getAccessToken();

        return new Promise((resolve, reject) => {
            fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
                method: 'POST',
                body: data,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then((json) => {
                    console.log('Response:', json);
                    resolve(json);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    postRating: async function(url: string, data: any): Promise<any> {
        console.log('--- apiService.ts: POST Rating Request ---');
        console.log('URL:', `${process.env.NEXT_PUBLIC_API_HOST}${url}`);
        console.log('Data:', data);
        console.log('Headers:', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
        });
        console.log('-----------------------------------------');

        const token = await getAccessToken();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
                method: 'POST',
                body: JSON.stringify(data), // Serialize the data to JSON
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json', // Explicitly set Content-Type
                    'Authorization': `Bearer ${token}`
                }
            });

            const json = await response.json();
            console.log('--- apiService.ts: POST Rating Response ---');
            console.log('Response:', json);
            console.log('------------------------------------------');

            // Normalize the response to match Rating.tsx expectations
            if (json.success) {
                return { success: true, data: json.data };
            } else {
                return { success: false, error: json.error || 'Failed to post rating' };
            }
        } catch (error) {
            console.error('POST Rating Error:', error);
            return { success: false, error: 'Failed to post rating' };
        }
    },

    postWithoutToken: async function(url: string, data: any): Promise<any> {
        console.log('post', url, data);

        return new Promise((resolve, reject) => {
            fetch(`${process.env.NEXT_PUBLIC_API_HOST}${url}`, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then((json) => {
                    console.log('Response:', json);
                    resolve(json);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}

export default apiService;