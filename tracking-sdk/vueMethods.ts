
function changeFunction(component:{[propsName:string]:any}, methodName:string, func:any) {
    let methodObj:{[propsName:string]:(any)=>any} = component.methods
    let str:string = methodObj[methodName].toString()
    methodObj[methodName] = function ():(any)=>any {
      if (typeof func === 'function') {
        func(arguments)
      }
      return (new Function(`return ${str}`))().call(this, arguments)
    }
  }

  export default changeFunction