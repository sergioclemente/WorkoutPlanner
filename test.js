var Foo = (function () {
    function Foo() {
    }
    Foo.prototype.bar = function () {
        return "raw";
    };
    return Foo;
})();
exports.Foo = Foo;
;
