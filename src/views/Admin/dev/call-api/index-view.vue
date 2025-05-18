<template>
    <div class="app-container">
        <h1>API Test Page</h1>
        <input class="form-control w-100" v-model="url" placeholder="Enter url" />
        <textarea v-model="requestData" placeholder="Enter JSON request" rows="10" cols="50"></textarea>
        <button @click="testApi">Test API</button>
        <div v-if="response">
            <h3>Response:</h3>
            <pre>{{ response }}</pre>
        </div>
    </div>
</template>

<script>
// Import the shared axios instance
import api from '@/axios/axios-helper.js'

export default {
    data() {
        return {
            url: 'ReceiptProduction/Import', // To hold the URL
            requestData: '', // To hold the JSON input
            response: null,
        };
    },
    methods: {
        async testApi() {
            try {
                let parsedData = {};
                if(this.requestData){
                 parsedData = JSON.parse(this.requestData); // Parse the JSON input
                }
                const res = await api.jewelry.post(this.url, parsedData)
                this.response = res.data;
            } catch (error) {
                console.error('API call failed:', error);
                this.response = 'Error occurred while calling the API.';
            }
        },
    },
};
</script>

<style scoped>
h1 {
    color: #333;
}
textarea {
    display: block;
    margin-top: 10px;
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-family: monospace;
}
button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}
</style>