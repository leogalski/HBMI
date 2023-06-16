var title = new Vue({
    el: '#title',
    data () {
        return {
            title: 'HBMI - ACME Inc.'
        }
    }
})

var app = new Vue({
    computed: {
        console: () => console,
        window: () => window,
    },
    el: '#app',
    data () {
        return {
            message: 'List of SBO companies:',
            companies: {}
        }
    },
    beforeMount(){
        console.log(`fdfd`);
        this.getData();
    },
    methods: {
        async getData() {
            // const res = await fetch('http://localhost:8080/api/getCompanies');
            // const data = await res.json();
            // this.companies = data;
            console.log(`fdgfgf`);
            await fetch('http://localhost:8080/api/getCompanies')
            .then(response => response.json())
            .then(function(json) { 
                this.companies = json;
                console.log(`fdgfgf`);
            })
        }
    }
})