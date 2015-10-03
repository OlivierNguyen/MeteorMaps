/* ---------------------------------------------------- +/
 
 ## Client Router ##
 
 Client-side Router.
 
 /+ ---------------------------------------------------- */

// Config

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
});

// Routes
Router.map(function () {
    // Pages
    this.route('homepage', {
        path: '/'
    });

    this.route('map');
});
