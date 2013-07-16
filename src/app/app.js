/**
 * Add all your dependencies here.
 *
 * @require widgets/Viewer.js
 * @require OpenLayers/Control/Zoom.js
 * @require plugins/LayerTree.js
 * @require plugins/OLSource.js
 * @require plugins/OSMSource.js
 * @require plugins/WMSCSource.js
 * @require plugins/ZoomToExtent.js
 * @require plugins/NavigationHistory.js
 * @require plugins/Zoom.js
 * @require plugins/AddLayers.js
 * @require plugins/RemoveLayer.js
 * @require RowExpander.js
 */

var app = new gxp.Viewer({
    listeners: {
        'ready': function() {
            app.mapPanel.layers.each(function(record) {
                var layer = record.getLayer();
                if (layer instanceof OpenLayers.Layer.WMS) {
                    app.wmsLayer = layer;
                    return false;
                }
            });
        }
    },
    portalConfig: {
        layout: "border",
        region: "center",
        
        // by configuring items here, we don't need to configure portalItems
        // and save a wrapping container
        items: [{
            id: "centerpanel",
            xtype: "panel",
            layout: "fit",
            region: "center",
            border: false,
            items: ["mymap"]
        }, {
            xtype: "panel",
            layout: "fit",
            region: "west",
            title: false,
            width: 250,
            height: "auto",
            layout: "vbox",
            layoutConfig: {
                align: "stretch",
                padding: "10",
                defaultMargins: "5 5",
                flex: 1
             },
             items: [{
                 xtype: "box",
                 layout: "fit",
                 height: "160",
                 border: "0",
                 margin: "0",
                 padding: "0",
                 html: "<p align='right'><img src='http://projects.opengeo.org/common/theme/img/logo.png'/><br/><b>Geonames Heat Map</b></p><p align='left'>Search and map the patterns in two&nbsp;million geographic names. Any names that contain the query word are added to the heat map.</p>"
             }, {
                 xtype: "fieldset",
                 title: "Enter a word",
                 layout: "fit",
                 items: [{
                     xtype: "textfield",
                     ref: "../../wordField",
                     emptyText: "Enter a word",
                     width: 180,
                     hideLabel: true,
                     listeners: {
                         specialkey: function(field, e) {
                             // Only update the word map when user hits 'enter' 
                             if (e.getKey() == e.ENTER) {
                                 app.wmsLayer.mergeNewParams({viewparams: "word:"+field.getValue()});
                                 app.portal.wordDescription.update("");
                             }
                         }
                     }
                 }]
             }, {
                 xtype: "fieldset",
                 title: "Or, select a word",
                 layout: "fit",
                 height: 200,
                 items: [{
                     xtype: "listview",
                     store: new Ext.data.JsonStore({
                         url: "wordmap-full-list.json",
                         autoLoad: true,
                         fields: ["word", "desc"]
                     }),
                     height: 180,
                     hideHeaders: true,
                     emptyText: 'No words available',
                     columns: [{
                         dataIndex: 'word'
                     }],
                     listeners: {
                         click: function(field, node) {
                             // Click returns the index of the clicked record.
                             // Get the record, then read the word from it.
                             var word = this.store.getAt(node).get('word');
                             var desc = this.store.getAt(node).get('desc');
                             app.wmsLayer.mergeNewParams({viewparams: "word:"+word});
                             app.portal.wordDescription.update(desc);
                             // Update the text field to display the clicked word
                             app.portal.wordField.setValue(word);
                         }
                     }
                 }]
             },{
                 xtype: "fieldset",
                 title: "About this word",
                 layout: "fit",
                 items: [{
                     xtype: "panel",
                     html: "",
                     ref: "../../wordDescription",
                     border: false,
                     height: 200,
                     autoScroll:true
                 }]
             },{
                 xtype: "box",
                 html: "<a href='../doc/en'>How we made this map</a>"
             }]  
        }]
    },
    
    // layer sources
    sources: {
        local: {
            ptype: "gxp_wmscsource",
            url: "http://demo.cleverelephant.ca:8080/geoserver/wms",
            version: "1.1.1",
            skipPing: true
        },
        osm: {
            ptype: "gxp_osmsource"
        }
    },
    
    // map and layers
    map: {
        id: "mymap", // id needed to reference map in portalConfig above
        projection: "EPSG:900913",
        center: [-10764594.758211, 4523072.3184791],
        zoom: 3,
        controls: [
            new OpenLayers.Control.Navigation({
                zoomWheelOptions: {interval: 250},
                dragPanOptions: {enableKinetic: true}
            }),
            new OpenLayers.Control.Zoom(),     
            new OpenLayers.Control.Attribution()
        ],
        layers: [{
            source: "osm",
            name: "mapnik",
            group: "background"
        }, {
            source: "local",
            name: "opengeo:geonames,opengeo:geonames",
            styles: "point,heatmap",
            title: "Geonames",
            tiled: false,
            transitionEffect: null,
            viewparams: "word:",
            opacity: 0.6,
            bbox: [-13919915.285383, 1871624.6816921, -7022237.8538889, 8681246.6566139]
        }]
    }

});
