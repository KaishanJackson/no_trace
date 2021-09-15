"use strict";
exports.__esModule = true;
function changeFunction(component, methodName, func) {
    var methodObj = component.methods;
    var str = methodObj[methodName].toString();
    methodObj[methodName] = function () {
        if (typeof func === 'function') {
            func(arguments);
        }
        return (new Function("return " + str))().call(this, arguments);
    };
}
exports["default"] = changeFunction;
