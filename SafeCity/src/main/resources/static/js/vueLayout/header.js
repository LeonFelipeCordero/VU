header = new Vue({
    el: '#header',
    data: {
        active: true,
        windowWidth: window.innerWidth
    },
    methods: {
        handleWindowResize: function(event) {
            this.windowWidth = event.currentTarget.innerWidth;
            this.active = this.windowWidth > 768;
        }
    },
    beforeMount: function () {
        this.active = this.windowWidth > 768;
    },
    mounted: function () {
        window.addEventListener('resize', this.handleWindowResize);
    }
});