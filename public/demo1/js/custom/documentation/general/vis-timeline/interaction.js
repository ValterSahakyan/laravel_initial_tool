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

/***/ "./resources/assets/core/js/custom/documentation/general/vis-timeline/interaction.js":
/*!*******************************************************************************************!*\
  !*** ./resources/assets/core/js/custom/documentation/general/vis-timeline/interaction.js ***!
  \*******************************************************************************************/
/***/ (() => {

eval(" // Class definition\n\nvar KTVisTimelineInteraction = function () {\n  // Private functions\n  var exampleInteraction = function exampleInteraction() {\n    // create a dataset with items\n    // we specify the type of the fields `start` and `end` here to be strings\n    // containing an ISO date. The fields will be outputted as ISO dates\n    // automatically getting data from the DataSet via items.get().\n    var items = new vis.DataSet({\n      type: {\n        start: \"ISODate\",\n        end: \"ISODate\"\n      }\n    }); // add items to the DataSet\n\n    items.add([{\n      id: 1,\n      content: \"item 1<br>start\",\n      start: \"2021-01-23\"\n    }, {\n      id: 2,\n      content: \"item 2\",\n      start: \"2021-01-18\"\n    }, {\n      id: 3,\n      content: \"item 3\",\n      start: \"2021-01-21\"\n    }, {\n      id: 4,\n      content: \"item 4\",\n      start: \"2021-01-19\",\n      end: \"2021-01-24\"\n    }, {\n      id: 5,\n      content: \"item 5\",\n      start: \"2021-01-28\",\n      type: \"point\"\n    }, {\n      id: 6,\n      content: \"item 6\",\n      start: \"2021-01-26\"\n    }]);\n    var container = document.getElementById(\"kt_docs_vistimeline_interaction\");\n    var options = {\n      start: \"2021-01-10\",\n      end: \"2021-02-10\",\n      editable: true,\n      showCurrentTime: true\n    };\n    var timeline = new vis.Timeline(container, items, options); // Handle buttons\n\n    document.getElementById(\"window1\").onclick = function () {\n      timeline.setWindow(\"2021-01-01\", \"2021-04-01\");\n    };\n\n    document.getElementById(\"fit\").onclick = function () {\n      timeline.fit();\n    };\n\n    document.getElementById(\"select\").onclick = function () {\n      timeline.setSelection([5, 6], {\n        focus: true\n      });\n    };\n\n    document.getElementById(\"focus1\").onclick = function () {\n      timeline.focus(2);\n    };\n\n    document.getElementById(\"moveTo\").onclick = function () {\n      timeline.moveTo(\"2021-02-01\");\n    };\n  };\n\n  return {\n    // Public Functions\n    init: function init() {\n      exampleInteraction();\n    }\n  };\n}(); // On document ready\n\n\nKTUtil.onDOMContentLoaded(function () {\n  KTVisTimelineInteraction.init();\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9yZXNvdXJjZXMvYXNzZXRzL2NvcmUvanMvY3VzdG9tL2RvY3VtZW50YXRpb24vZ2VuZXJhbC92aXMtdGltZWxpbmUvaW50ZXJhY3Rpb24uanMuanMiLCJtYXBwaW5ncyI6IkNBRUE7O0FBQ0EsSUFBSUEsd0JBQXdCLEdBQUcsWUFBWTtBQUN2QztBQUNBLE1BQUlDLGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsR0FBWTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUlDLEtBQUssR0FBRyxJQUFJQyxHQUFHLENBQUNDLE9BQVIsQ0FBZ0I7QUFDeEJDLE1BQUFBLElBQUksRUFBRTtBQUFFQyxRQUFBQSxLQUFLLEVBQUUsU0FBVDtBQUFvQkMsUUFBQUEsR0FBRyxFQUFFO0FBQXpCO0FBRGtCLEtBQWhCLENBQVosQ0FMaUMsQ0FTakM7O0FBQ0FMLElBQUFBLEtBQUssQ0FBQ00sR0FBTixDQUFVLENBQ047QUFBRUMsTUFBQUEsRUFBRSxFQUFFLENBQU47QUFBU0MsTUFBQUEsT0FBTyxFQUFFLGlCQUFsQjtBQUFxQ0osTUFBQUEsS0FBSyxFQUFFO0FBQTVDLEtBRE0sRUFFTjtBQUFFRyxNQUFBQSxFQUFFLEVBQUUsQ0FBTjtBQUFTQyxNQUFBQSxPQUFPLEVBQUUsUUFBbEI7QUFBNEJKLE1BQUFBLEtBQUssRUFBRTtBQUFuQyxLQUZNLEVBR047QUFBRUcsTUFBQUEsRUFBRSxFQUFFLENBQU47QUFBU0MsTUFBQUEsT0FBTyxFQUFFLFFBQWxCO0FBQTRCSixNQUFBQSxLQUFLLEVBQUU7QUFBbkMsS0FITSxFQUlOO0FBQUVHLE1BQUFBLEVBQUUsRUFBRSxDQUFOO0FBQVNDLE1BQUFBLE9BQU8sRUFBRSxRQUFsQjtBQUE0QkosTUFBQUEsS0FBSyxFQUFFLFlBQW5DO0FBQWlEQyxNQUFBQSxHQUFHLEVBQUU7QUFBdEQsS0FKTSxFQUtOO0FBQUVFLE1BQUFBLEVBQUUsRUFBRSxDQUFOO0FBQVNDLE1BQUFBLE9BQU8sRUFBRSxRQUFsQjtBQUE0QkosTUFBQUEsS0FBSyxFQUFFLFlBQW5DO0FBQWlERCxNQUFBQSxJQUFJLEVBQUU7QUFBdkQsS0FMTSxFQU1OO0FBQUVJLE1BQUFBLEVBQUUsRUFBRSxDQUFOO0FBQVNDLE1BQUFBLE9BQU8sRUFBRSxRQUFsQjtBQUE0QkosTUFBQUEsS0FBSyxFQUFFO0FBQW5DLEtBTk0sQ0FBVjtBQVNBLFFBQUlLLFNBQVMsR0FBR0MsUUFBUSxDQUFDQyxjQUFULENBQXdCLGlDQUF4QixDQUFoQjtBQUNBLFFBQUlDLE9BQU8sR0FBRztBQUNWUixNQUFBQSxLQUFLLEVBQUUsWUFERztBQUVWQyxNQUFBQSxHQUFHLEVBQUUsWUFGSztBQUdWUSxNQUFBQSxRQUFRLEVBQUUsSUFIQTtBQUlWQyxNQUFBQSxlQUFlLEVBQUU7QUFKUCxLQUFkO0FBT0EsUUFBSUMsUUFBUSxHQUFHLElBQUlkLEdBQUcsQ0FBQ2UsUUFBUixDQUFpQlAsU0FBakIsRUFBNEJULEtBQTVCLEVBQW1DWSxPQUFuQyxDQUFmLENBM0JpQyxDQTZCakM7O0FBQ0FGLElBQUFBLFFBQVEsQ0FBQ0MsY0FBVCxDQUF3QixTQUF4QixFQUFtQ00sT0FBbkMsR0FBNkMsWUFBWTtBQUNyREYsTUFBQUEsUUFBUSxDQUFDRyxTQUFULENBQW1CLFlBQW5CLEVBQWlDLFlBQWpDO0FBQ0gsS0FGRDs7QUFHQVIsSUFBQUEsUUFBUSxDQUFDQyxjQUFULENBQXdCLEtBQXhCLEVBQStCTSxPQUEvQixHQUF5QyxZQUFZO0FBQ2pERixNQUFBQSxRQUFRLENBQUNJLEdBQVQ7QUFDSCxLQUZEOztBQUdBVCxJQUFBQSxRQUFRLENBQUNDLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0NNLE9BQWxDLEdBQTRDLFlBQVk7QUFDcERGLE1BQUFBLFFBQVEsQ0FBQ0ssWUFBVCxDQUFzQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQXRCLEVBQThCO0FBQzFCQyxRQUFBQSxLQUFLLEVBQUU7QUFEbUIsT0FBOUI7QUFHSCxLQUpEOztBQUtBWCxJQUFBQSxRQUFRLENBQUNDLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0NNLE9BQWxDLEdBQTRDLFlBQVk7QUFDcERGLE1BQUFBLFFBQVEsQ0FBQ00sS0FBVCxDQUFlLENBQWY7QUFDSCxLQUZEOztBQUdBWCxJQUFBQSxRQUFRLENBQUNDLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0NNLE9BQWxDLEdBQTRDLFlBQVk7QUFDcERGLE1BQUFBLFFBQVEsQ0FBQ08sTUFBVCxDQUFnQixZQUFoQjtBQUNILEtBRkQ7QUFHSCxHQS9DRDs7QUFpREEsU0FBTztBQUNIO0FBQ0FDLElBQUFBLElBQUksRUFBRSxnQkFBWTtBQUNkeEIsTUFBQUEsa0JBQWtCO0FBQ3JCO0FBSkUsR0FBUDtBQU1ILENBekQ4QixFQUEvQixDLENBMkRBOzs7QUFDQXlCLE1BQU0sQ0FBQ0Msa0JBQVAsQ0FBMEIsWUFBWTtBQUNsQzNCLEVBQUFBLHdCQUF3QixDQUFDeUIsSUFBekI7QUFDSCxDQUZEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2Fzc2V0cy9jb3JlL2pzL2N1c3RvbS9kb2N1bWVudGF0aW9uL2dlbmVyYWwvdmlzLXRpbWVsaW5lL2ludGVyYWN0aW9uLmpzPzNlNjAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIENsYXNzIGRlZmluaXRpb25cbnZhciBLVFZpc1RpbWVsaW5lSW50ZXJhY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcbiAgICB2YXIgZXhhbXBsZUludGVyYWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBjcmVhdGUgYSBkYXRhc2V0IHdpdGggaXRlbXNcbiAgICAgICAgLy8gd2Ugc3BlY2lmeSB0aGUgdHlwZSBvZiB0aGUgZmllbGRzIGBzdGFydGAgYW5kIGBlbmRgIGhlcmUgdG8gYmUgc3RyaW5nc1xuICAgICAgICAvLyBjb250YWluaW5nIGFuIElTTyBkYXRlLiBUaGUgZmllbGRzIHdpbGwgYmUgb3V0cHV0dGVkIGFzIElTTyBkYXRlc1xuICAgICAgICAvLyBhdXRvbWF0aWNhbGx5IGdldHRpbmcgZGF0YSBmcm9tIHRoZSBEYXRhU2V0IHZpYSBpdGVtcy5nZXQoKS5cbiAgICAgICAgdmFyIGl0ZW1zID0gbmV3IHZpcy5EYXRhU2V0KHtcbiAgICAgICAgICAgIHR5cGU6IHsgc3RhcnQ6IFwiSVNPRGF0ZVwiLCBlbmQ6IFwiSVNPRGF0ZVwiIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGFkZCBpdGVtcyB0byB0aGUgRGF0YVNldFxuICAgICAgICBpdGVtcy5hZGQoW1xuICAgICAgICAgICAgeyBpZDogMSwgY29udGVudDogXCJpdGVtIDE8YnI+c3RhcnRcIiwgc3RhcnQ6IFwiMjAyMS0wMS0yM1wiIH0sXG4gICAgICAgICAgICB7IGlkOiAyLCBjb250ZW50OiBcIml0ZW0gMlwiLCBzdGFydDogXCIyMDIxLTAxLTE4XCIgfSxcbiAgICAgICAgICAgIHsgaWQ6IDMsIGNvbnRlbnQ6IFwiaXRlbSAzXCIsIHN0YXJ0OiBcIjIwMjEtMDEtMjFcIiB9LFxuICAgICAgICAgICAgeyBpZDogNCwgY29udGVudDogXCJpdGVtIDRcIiwgc3RhcnQ6IFwiMjAyMS0wMS0xOVwiLCBlbmQ6IFwiMjAyMS0wMS0yNFwiIH0sXG4gICAgICAgICAgICB7IGlkOiA1LCBjb250ZW50OiBcIml0ZW0gNVwiLCBzdGFydDogXCIyMDIxLTAxLTI4XCIsIHR5cGU6IFwicG9pbnRcIiB9LFxuICAgICAgICAgICAgeyBpZDogNiwgY29udGVudDogXCJpdGVtIDZcIiwgc3RhcnQ6IFwiMjAyMS0wMS0yNlwiIH0sXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImt0X2RvY3NfdmlzdGltZWxpbmVfaW50ZXJhY3Rpb25cIik7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgc3RhcnQ6IFwiMjAyMS0wMS0xMFwiLFxuICAgICAgICAgICAgZW5kOiBcIjIwMjEtMDItMTBcIixcbiAgICAgICAgICAgIGVkaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0N1cnJlbnRUaW1lOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0aW1lbGluZSA9IG5ldyB2aXMuVGltZWxpbmUoY29udGFpbmVyLCBpdGVtcywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gSGFuZGxlIGJ1dHRvbnNcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3aW5kb3cxXCIpLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aW1lbGluZS5zZXRXaW5kb3coXCIyMDIxLTAxLTAxXCIsIFwiMjAyMS0wNC0wMVwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaXRcIikub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lLmZpdCgpO1xuICAgICAgICB9O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdFwiKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGltZWxpbmUuc2V0U2VsZWN0aW9uKFs1LCA2XSwge1xuICAgICAgICAgICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9jdXMxXCIpLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aW1lbGluZS5mb2N1cygyKTtcbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb3ZlVG9cIikub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lLm1vdmVUbyhcIjIwMjEtMDItMDFcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gUHVibGljIEZ1bmN0aW9uc1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleGFtcGxlSW50ZXJhY3Rpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG59KCk7XG5cbi8vIE9uIGRvY3VtZW50IHJlYWR5XG5LVFV0aWwub25ET01Db250ZW50TG9hZGVkKGZ1bmN0aW9uICgpIHtcbiAgICBLVFZpc1RpbWVsaW5lSW50ZXJhY3Rpb24uaW5pdCgpO1xufSk7XG4iXSwibmFtZXMiOlsiS1RWaXNUaW1lbGluZUludGVyYWN0aW9uIiwiZXhhbXBsZUludGVyYWN0aW9uIiwiaXRlbXMiLCJ2aXMiLCJEYXRhU2V0IiwidHlwZSIsInN0YXJ0IiwiZW5kIiwiYWRkIiwiaWQiLCJjb250ZW50IiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsIm9wdGlvbnMiLCJlZGl0YWJsZSIsInNob3dDdXJyZW50VGltZSIsInRpbWVsaW5lIiwiVGltZWxpbmUiLCJvbmNsaWNrIiwic2V0V2luZG93IiwiZml0Iiwic2V0U2VsZWN0aW9uIiwiZm9jdXMiLCJtb3ZlVG8iLCJpbml0IiwiS1RVdGlsIiwib25ET01Db250ZW50TG9hZGVkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./resources/assets/core/js/custom/documentation/general/vis-timeline/interaction.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./resources/assets/core/js/custom/documentation/general/vis-timeline/interaction.js"]();
/******/ 	
/******/ })()
;