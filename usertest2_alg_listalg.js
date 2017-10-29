var dumbalg = (function () {
        "use strict";

        var da = {
            algname: 'DumbAlg',
            um: [],
            db: [],
            umneedclustering: true,
            hasdregs: -1
        };


        da.onDataSetChange = function () {
            da.um = [];
            da.umneedclustering = true;
            da.hasdregs = -1;
        };


        da.onDataSetDocChange = function (dbrawitem) {
            if (da.umneedclustering === true || da.um.length === 0) {
                da.db = doClustering(dbrawitem);
                da.umneedclustering = false;
                da.hasdregs = -1;
            } else {
                da.db = da.doGroupingAndOrdering(dbrawitem);
            }
        };


        da.umRecord = function (hasmovedx) {
            // Adjust the grouping and ordering of predicates.
            var gi, g, gt = [], ti, t, u = [], o = da.um, c = [[]], ocgi = -1, octi = -1, oterm, ucgi = -1, ucti = -1, uterm;
            //if (hasmovedx) {
            if(true) {
                // Record the grouping and ordering from the UI
                for (gi = 0; gi < da.db.length; gi++) {
                    g = da.db[gi];
                    gt = [];
                    for (ti = 0; ti < g.length; ti++) {
                        t = g[ti];
                        gt.push(t[0]);
                    }
                    u.push(gt);
                }

                // Merge the new data with the old usermodel
                while (ucgi < u.length || ocgi < o.length) {
                    // Ready to start a new group in the output
                    if (ucti === -1 && octi === -1) {
                        // Only make a new group if the previous one is not empty (can happen where items in o are moved later in u)
                        if (c[c.length - 1].length > 0) {
                            c.push([]);
                        }
                        ucgi++;
                        uterm = undefined;
                        if (ucgi >= u.length) {
                            ucgi = u.length;
                            ucti = -1;
                        } else {
                            ucti = 0;
                        }
                        ocgi++;
                        oterm = undefined;
                        if (ocgi >= o.length) {
                            ocgi = o.length;
                            octi = -1;
                        } else {
                            octi = 0;
                        }
                        continue;
                    }

                    if (ucgi > -1 && ucti > -1) {
                        uterm = u[ucgi][ucti];
                    }
                    if (ocgi > -1 && octi > -1) {
                        oterm = o[ocgi][octi];
                    }
                    if (uterm === oterm) {
                        da.addTerm(c, uterm);
                        ucti++;
                        if (ucti >= u[ucgi].length) {
                            ucti = -1;
                            uterm = undefined;
                        }
                        octi++;
                        if (octi >= o[ocgi].length) {
                            octi = -1;
                            oterm = undefined;
                        }
                    } else if (octi > -1 && da.whichGroupForTerm(u, oterm) === -1) {
                        // If the old model o has something the new model u doesn't at all then output that now
                        da.addTerm(c, oterm);
                        octi++;
                        if (octi >= o[ocgi].length) {
                            octi = -1;
                            oterm = undefined;
                        }
                    } else if (ucti > -1) {
                        // Give preference to items from the new model u
                        da.addTerm(c, uterm);
                        ucti++;
                        if (ucti >= u[ucgi].length) {
                            ucti = -1;
                            uterm = undefined;
                        }
                    } else {
                        // Only add terms from the old model o where they not someplace in the new model u, otherwise just skip over
                        if (da.whichGroupForTerm(u, oterm) === -1) {
                            da.addTerm(c, oterm);
                        }
                        octi++;
                        if (octi >= o[ocgi].length) {
                            octi = -1;
                            oterm = undefined;
                        }
                    }
                }
                // Cleanup the last group because it'll be empty
                c.pop();
                da.um = c;
                da.umneedclustering = false;
            } else if (da.um.length === 0) {
                da.umneedclustering = true;
            }
        };


        da.whichGroupForTerm = function (um, term) {
            var gi;

            if (um.length > 0) {
                // Look for group that contains the term
                for (gi = 0; gi < um.length; gi++) {
                    if (um[gi].indexOf(term) > -1) {
                        return gi;
                    }
                }
            }

            // No idea which group the term goes into
            return -1;
        };


        da.addTerm = function (um, term) {
            var r = da.whichGroupForTerm(um, term);

            if (r === -1) {
                um[um.length - 1].push(term);
            }

            return r;
        };


        da.doGroupingAndOrdering = function (t) {
            var r = [], ti, thisitem, foundspot, fgi, fti, r1 = [], rg, rgi, rti;

            da.hasdregs = -1;
            r[da.um.length + 1] = []; // The dregpool

            for (ti = 0; ti < t.length; ti++) {
                thisitem = t[ti];
                foundspot = false;
                for (fgi = 0; fgi < da.um.length && !foundspot; fgi++) {
                    for (fti = 0; fti < da.um[fgi].length && !foundspot; fti++) {
                        if (thisitem[0] === da.um[fgi][fti]) {
                            if (r[fgi] === undefined) {
                                r[fgi] = [];
                            }
                            while (r[fgi][fti] !== undefined) {
                                fti++;
                            }
                            r[fgi][fti] = thisitem;
                            foundspot = true;
                            break;
                        }
                    }
                }
                if (!foundspot) {
                    r[da.um.length + 1].push(thisitem);
                    da.hasdregs = 1;
                }
            }

            // Clear out the blanks
            for (rgi = 0; rgi < r.length; rgi++) {
                if (r[rgi] !== undefined) {
                    rg = [];
                    for (rti = 0; rti < r[rgi].length; rti++) {
                        if (r[rgi][rti] !== undefined) {
                            rg.push(r[rgi][rti]);
                        }
                    }
                    r1.push(rg);
                }
            }

            // Point to the dregpool if necessary
            if (da.hasdregs > -1) {
                da.hasdregs = r1.length - 1;
            }

            // Cleanup last group if it is empty
            if (r1[r1.length - 1].length === 0) {
                r1.pop();
            }

            return r1;
        };

        //Return the module
        return da;
    }());

