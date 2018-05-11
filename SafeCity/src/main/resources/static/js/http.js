/**
 * Created by leon on 18/05/2017.
 *
 */

function getPopUpFrom(marker) {
    data = {
        lat : marker.getPosition().lat(),
        lng : marker.getPosition().lng()
    };

    var content;
    $.ajax({
        url: '/incident-form',
        data: data,
        type: 'GET',
        async: false,
        timeout: 2000,
        error: function () {
            content = '<h3>Sorry Something Went Wrong!!!!!</h3>';
        },
        success: function (template) {
            content = template;
        }
    });

    return content;
}

function getNearIncidents(point, callback){

    // $.ajax({
    //     url: '/incident/near',
    //     data: { lat: point.lat(), lng: point.lng() },
    //     type: 'GET',
    //     success: function (res) {
    //         callback(res);
    //     },
    //     error: function (res) {
    //         callback('<h3>Sorry Something Went Wrong!!!!!</h3>');
    //     }
    // });
}

function getStatsByLocation(lat, lng, callback){
    $.ajax({
       url: '/statistics',
       data: {lat: lat, lng: lng},
       type: 'GET',
        success: function (res) {
            callback(res);
        },
        error: function (res) {
            callback('<h3>Sorry Something Went Wrong!!!!!</h3>');
        }
    });
}
