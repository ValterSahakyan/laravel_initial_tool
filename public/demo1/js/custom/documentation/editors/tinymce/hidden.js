/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./resources/assets/core/js/custom/documentation/editors/tinymce/hidden.js":
/*!*********************************************************************************!*\
  !*** ./resources/assets/core/js/custom/documentation/editors/tinymce/hidden.js ***!
  \*********************************************************************************/
/***/ (() => {

eval(" // Class definition\n\nvar KTFormsTinyMCEHidden = function () {\n  // Private functions\n  var exampleHidden = function exampleHidden() {\n    tinymce.init({\n      selector: '#kt_docs_tinymce_hidden',\n      menubar: false,\n      toolbar: ['styleselect fontselect fontsizeselect', 'undo redo | cut copy paste | bold italic | link image | alignleft aligncenter alignright alignjustify', 'bullist numlist | outdent indent | blockquote subscript superscript | advlist | autolink | lists charmap | print preview |  code'],\n      plugins: 'advlist autolink link image lists charmap print preview code'\n    });\n  };\n\n  return {\n    // Public Functions\n    init: function init() {\n      exampleHidden();\n    }\n  };\n}(); // On document ready\n\n\nKTUtil.onDOMContentLoaded(function () {\n  KTFormsTinyMCEHidden.init();\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9yZXNvdXJjZXMvYXNzZXRzL2NvcmUvanMvY3VzdG9tL2RvY3VtZW50YXRpb24vZWRpdG9ycy90aW55bWNlL2hpZGRlbi5qcy5qcyIsIm1hcHBpbmdzIjoiQ0FFQTs7QUFDQSxJQUFJQSxvQkFBb0IsR0FBRyxZQUFXO0FBQ2xDO0FBQ0EsTUFBSUMsYUFBYSxHQUFHLFNBQWhCQSxhQUFnQixHQUFXO0FBQzNCQyxJQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYTtBQUNUQyxNQUFBQSxRQUFRLEVBQUUseUJBREQ7QUFFVEMsTUFBQUEsT0FBTyxFQUFFLEtBRkE7QUFHVEMsTUFBQUEsT0FBTyxFQUFFLENBQUMsdUNBQUQsRUFDTCx1R0FESyxFQUVMLGtJQUZLLENBSEE7QUFNVEMsTUFBQUEsT0FBTyxFQUFHO0FBTkQsS0FBYjtBQVFILEdBVEQ7O0FBV0EsU0FBTztBQUNIO0FBQ0FKLElBQUFBLElBQUksRUFBRSxnQkFBVztBQUNiRixNQUFBQSxhQUFhO0FBQ2hCO0FBSkUsR0FBUDtBQU1ILENBbkIwQixFQUEzQixDLENBcUJBOzs7QUFDQU8sTUFBTSxDQUFDQyxrQkFBUCxDQUEwQixZQUFXO0FBQ2pDVCxFQUFBQSxvQkFBb0IsQ0FBQ0csSUFBckI7QUFDSCxDQUZEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9jb3JlL2pzL2N1c3RvbS9kb2N1bWVudGF0aW9uL2VkaXRvcnMvdGlueW1jZS9oaWRkZW4uanM/NDhlMSJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuLy8gQ2xhc3MgZGVmaW5pdGlvblxudmFyIEtURm9ybXNUaW55TUNFSGlkZGVuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcbiAgICB2YXIgZXhhbXBsZUhpZGRlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW55bWNlLmluaXQoe1xuICAgICAgICAgICAgc2VsZWN0b3I6ICcja3RfZG9jc190aW55bWNlX2hpZGRlbicsXG4gICAgICAgICAgICBtZW51YmFyOiBmYWxzZSxcbiAgICAgICAgICAgIHRvb2xiYXI6IFsnc3R5bGVzZWxlY3QgZm9udHNlbGVjdCBmb250c2l6ZXNlbGVjdCcsXG4gICAgICAgICAgICAgICAgJ3VuZG8gcmVkbyB8IGN1dCBjb3B5IHBhc3RlIHwgYm9sZCBpdGFsaWMgfCBsaW5rIGltYWdlIHwgYWxpZ25sZWZ0IGFsaWduY2VudGVyIGFsaWducmlnaHQgYWxpZ25qdXN0aWZ5JyxcbiAgICAgICAgICAgICAgICAnYnVsbGlzdCBudW1saXN0IHwgb3V0ZGVudCBpbmRlbnQgfCBibG9ja3F1b3RlIHN1YnNjcmlwdCBzdXBlcnNjcmlwdCB8IGFkdmxpc3QgfCBhdXRvbGluayB8IGxpc3RzIGNoYXJtYXAgfCBwcmludCBwcmV2aWV3IHwgIGNvZGUnXSxcbiAgICAgICAgICAgIHBsdWdpbnMgOiAnYWR2bGlzdCBhdXRvbGluayBsaW5rIGltYWdlIGxpc3RzIGNoYXJtYXAgcHJpbnQgcHJldmlldyBjb2RlJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBQdWJsaWMgRnVuY3Rpb25zXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZXhhbXBsZUhpZGRlbigpO1xuICAgICAgICB9XG4gICAgfTtcbn0oKTtcblxuLy8gT24gZG9jdW1lbnQgcmVhZHlcbktUVXRpbC5vbkRPTUNvbnRlbnRMb2FkZWQoZnVuY3Rpb24oKSB7XG4gICAgS1RGb3Jtc1RpbnlNQ0VIaWRkZW4uaW5pdCgpO1xufSk7XG4iXSwibmFtZXMiOlsiS1RGb3Jtc1RpbnlNQ0VIaWRkZW4iLCJleGFtcGxlSGlkZGVuIiwidGlueW1jZSIsImluaXQiLCJzZWxlY3RvciIsIm1lbnViYXIiLCJ0b29sYmFyIiwicGx1Z2lucyIsIktUVXRpbCIsIm9uRE9NQ29udGVudExvYWRlZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./resources/assets/core/js/custom/documentation/editors/tinymce/hidden.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./resources/assets/core/js/custom/documentation/editors/tinymce/hidden.js"]();
/******/ 	
/******/ })()
;