var abcorderalg = (function () {
        "use strict";

        var da = {
            algname: 'ABCOrder',
            um: [],
            db: [],
            umneedclustering: true,
            hasdregs: -1
        };


        da.onDataSetChange = function () {
            da.um = [];
            da.umneedclustering = false;
            da.hasdregs = -1;
        };


        da.onDataSetDocChange = function (dbrawitem) {
            da.umneedclustering = false;
            da.hasdregs = -1;
            da.db = da.doGroupingAndOrdering(dbrawitem);
        };


        da.umRecord = function (hasmovedx) {
            da.umneedclustering = false;
        };


        da.whichGroupForTerm = function (um, term) {
            return 0;
        };


        da.addTerm = function (um, term) {
            um[0].push(term);
            return 0;
        };


        da.doGroupingAndOrdering = function (t) {
            var r = [[]];
            
            r[0] = t.slice();
            r[0].sort(function(a, b) {
                return a[0] > b[0] ? 1 : -1;
            });

            return r;
        };

        //Return the module
        return da;
    }());

