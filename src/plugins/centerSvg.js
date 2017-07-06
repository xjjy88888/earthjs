// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {focused: null, svgAddCountriesOld: null}

    function country(cnt, id) {
        id = id.replace('x', '');
        for(let i=0, l=cnt.length; i<l; i++) {
            if(cnt[i].id == id) {return cnt[i];}
        }
    }

    function transition(p) {
        d3.transition()
        .duration(2500)
        .tween("rotate", () => {
            const  r = d3.interpolate(this._.proj.rotate(), [-p[0], -p[1], 0]);
            return t => {
                this._.rotate(r(t));
            };
        })
    }

    function create() {
        const _this = this;
        this.worldSvg.$countries()
        .on("click", function() {
            if (_this._.options.enableCenter) {
                const id = this.id.replace('x', '');
                const c = _this.worldSvg.countries();
                const focusedCountry = country(c, id);
                const p = d3.geoCentroid(focusedCountry);
                transition.call(_this, p);
                if (typeof(_.focused)==='function') {
                    _.focused.call(_this);
                }
            }
        });
    }

    return {
        name: 'centerSvg',
        onInit() {
            this._.options.enableCenter = true;
        },
        onCreate() {
            create.call(this);
        },
        go(id) {
            const c = this.worldSvg.countries();
            const focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused(fn) {
            _.focused = fn;
        }
    }
}