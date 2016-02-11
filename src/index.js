var ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
} ;

if ( typeof window !== 'undefined' ){
    window.ge = ge ;
}else{
    module.exports = ge ;
}
