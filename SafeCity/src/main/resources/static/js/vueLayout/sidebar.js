sidebar = new Vue({
    el: '#sidebar',
    data: {
        active: false,
        windowWidth: window.innerWidth,
        open: false,
        styleObject: {
            width: '5%'
        }
    },
    methods: {
        handleWindowResize: function (event) {
            this.windowWidth = event.currentTarget.innerWidth;
            this.active = this.windowWidth <= 767;
        },
        changeStatus: function () {
            this.open = !this.open;
            if (this.open) {
                this.styleObject['width'] = '20%';
            } else {
                this.styleObject['width'] = '5%';
            }
        }
    },
    beforeMount: function () {
        this.active = this.windowWidth <= 767;
    },
    mounted: function () {
        window.addEventListener('resize', this.handleWindowResize);
    }
});