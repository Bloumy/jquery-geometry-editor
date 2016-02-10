var ge = {
    GeometryEditor: require('./GeometryEditor')
} ;

if ( typeof window !== 'undefined' ){
    window.ge = ge ;
}else{
    module.exports = ge ;
}
