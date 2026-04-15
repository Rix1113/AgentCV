/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/projects/route";
exports.ids = ["app/api/projects/route"];
exports.modules = {

/***/ "(rsc)/./app/api/projects/route.ts":
/*!***********************************!*\
  !*** ./app/api/projects/route.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PATCH: () => (/* binding */ PATCH),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_validators_input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/validators/input */ \"(rsc)/./lib/validators/input.ts\");\n/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/utils */ \"(rsc)/./lib/utils.ts\");\n/* harmony import */ var _lib_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/store */ \"(rsc)/./lib/store.ts\");\n\n\n\n\nasync function GET() {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        projects: (0,_lib_store__WEBPACK_IMPORTED_MODULE_3__.listProjects)()\n    });\n}\nasync function POST(request) {\n    const body = await request.json();\n    const parsed = _lib_validators_input__WEBPACK_IMPORTED_MODULE_1__.projectInputSchema.parse(body);\n    const now = new Date().toISOString();\n    const project = {\n        id: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.makeId)(\"proj\"),\n        title: parsed.title,\n        cvText: parsed.cvText,\n        jobAdText: parsed.jobAdText,\n        createdAt: now,\n        updatedAt: now\n    };\n    (0,_lib_store__WEBPACK_IMPORTED_MODULE_3__.saveProject)(project);\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(project, {\n        status: 201\n    });\n}\nasync function PATCH(request) {\n    const body = await request.json();\n    const existing = (0,_lib_store__WEBPACK_IMPORTED_MODULE_3__.getProject)(body.projectId);\n    if (!existing) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Project not found\"\n        }, {\n            status: 404\n        });\n    }\n    const updated = {\n        ...existing,\n        documents: body.documents ?? existing.documents,\n        updatedAt: new Date().toISOString()\n    };\n    (0,_lib_store__WEBPACK_IMPORTED_MODULE_3__.saveProject)(updated);\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(updated);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Byb2plY3RzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBd0Q7QUFDSTtBQUN2QjtBQUMrQjtBQUU3RCxlQUFlTTtJQUNwQixPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUVDLFVBQVVKLHdEQUFZQTtJQUFHO0FBQ3REO0FBRU8sZUFBZUssS0FBS0MsT0FBb0I7SUFDN0MsTUFBTUMsT0FBTyxNQUFNRCxRQUFRSCxJQUFJO0lBQy9CLE1BQU1LLFNBQVNYLHFFQUFrQkEsQ0FBQ1ksS0FBSyxDQUFDRjtJQUN4QyxNQUFNRyxNQUFNLElBQUlDLE9BQU9DLFdBQVc7SUFDbEMsTUFBTUMsVUFBVTtRQUNkQyxJQUFJaEIsa0RBQU1BLENBQUM7UUFDWGlCLE9BQU9QLE9BQU9PLEtBQUs7UUFDbkJDLFFBQVFSLE9BQU9RLE1BQU07UUFDckJDLFdBQVdULE9BQU9TLFNBQVM7UUFDM0JDLFdBQVdSO1FBQ1hTLFdBQVdUO0lBQ2I7SUFDQVQsdURBQVdBLENBQUNZO0lBQ1osT0FBT2pCLHFEQUFZQSxDQUFDTyxJQUFJLENBQUNVLFNBQVM7UUFBRU8sUUFBUTtJQUFJO0FBQ2xEO0FBRU8sZUFBZUMsTUFBTWYsT0FBb0I7SUFDOUMsTUFBTUMsT0FBTyxNQUFNRCxRQUFRSCxJQUFJO0lBQy9CLE1BQU1tQixXQUFXdkIsc0RBQVVBLENBQUNRLEtBQUtnQixTQUFTO0lBQzFDLElBQUksQ0FBQ0QsVUFBVTtRQUNiLE9BQU8xQixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1lBQUVxQixPQUFPO1FBQW9CLEdBQUc7WUFBRUosUUFBUTtRQUFJO0lBQ3pFO0lBRUEsTUFBTUssVUFBVTtRQUNkLEdBQUdILFFBQVE7UUFDWEksV0FBV25CLEtBQUttQixTQUFTLElBQUlKLFNBQVNJLFNBQVM7UUFDL0NQLFdBQVcsSUFBSVIsT0FBT0MsV0FBVztJQUNuQztJQUNBWCx1REFBV0EsQ0FBQ3dCO0lBQ1osT0FBTzdCLHFEQUFZQSxDQUFDTyxJQUFJLENBQUNzQjtBQUMzQiIsInNvdXJjZXMiOlsiL1VzZXJzL3JpeC9Eb2N1bWVudHMvUHJvZ3JlbWluZS9BZ2VudHMvQ1YvZXN0b25pYW4tam9iLWFnZW50L2FwcC9hcGkvcHJvamVjdHMvcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHsgcHJvamVjdElucHV0U2NoZW1hIH0gZnJvbSBcIkAvbGliL3ZhbGlkYXRvcnMvaW5wdXRcIjtcbmltcG9ydCB7IG1ha2VJZCB9IGZyb20gXCJAL2xpYi91dGlsc1wiO1xuaW1wb3J0IHsgZ2V0UHJvamVjdCwgbGlzdFByb2plY3RzLCBzYXZlUHJvamVjdCB9IGZyb20gXCJAL2xpYi9zdG9yZVwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBwcm9qZWN0czogbGlzdFByb2plY3RzKCkgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcbiAgY29uc3QgcGFyc2VkID0gcHJvamVjdElucHV0U2NoZW1hLnBhcnNlKGJvZHkpO1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnN0IHByb2plY3QgPSB7XG4gICAgaWQ6IG1ha2VJZChcInByb2pcIiksXG4gICAgdGl0bGU6IHBhcnNlZC50aXRsZSxcbiAgICBjdlRleHQ6IHBhcnNlZC5jdlRleHQsXG4gICAgam9iQWRUZXh0OiBwYXJzZWQuam9iQWRUZXh0LFxuICAgIGNyZWF0ZWRBdDogbm93LFxuICAgIHVwZGF0ZWRBdDogbm93LFxuICB9O1xuICBzYXZlUHJvamVjdChwcm9qZWN0KTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHByb2plY3QsIHsgc3RhdHVzOiAyMDEgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQQVRDSChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gIGNvbnN0IGV4aXN0aW5nID0gZ2V0UHJvamVjdChib2R5LnByb2plY3RJZCk7XG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJQcm9qZWN0IG5vdCBmb3VuZFwiIH0sIHsgc3RhdHVzOiA0MDQgfSk7XG4gIH1cblxuICBjb25zdCB1cGRhdGVkID0ge1xuICAgIC4uLmV4aXN0aW5nLFxuICAgIGRvY3VtZW50czogYm9keS5kb2N1bWVudHMgPz8gZXhpc3RpbmcuZG9jdW1lbnRzLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICB9O1xuICBzYXZlUHJvamVjdCh1cGRhdGVkKTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHVwZGF0ZWQpO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByb2plY3RJbnB1dFNjaGVtYSIsIm1ha2VJZCIsImdldFByb2plY3QiLCJsaXN0UHJvamVjdHMiLCJzYXZlUHJvamVjdCIsIkdFVCIsImpzb24iLCJwcm9qZWN0cyIsIlBPU1QiLCJyZXF1ZXN0IiwiYm9keSIsInBhcnNlZCIsInBhcnNlIiwibm93IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwicHJvamVjdCIsImlkIiwidGl0bGUiLCJjdlRleHQiLCJqb2JBZFRleHQiLCJjcmVhdGVkQXQiLCJ1cGRhdGVkQXQiLCJzdGF0dXMiLCJQQVRDSCIsImV4aXN0aW5nIiwicHJvamVjdElkIiwiZXJyb3IiLCJ1cGRhdGVkIiwiZG9jdW1lbnRzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/projects/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/store.ts":
/*!**********************!*\
  !*** ./lib/store.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getProject: () => (/* binding */ getProject),\n/* harmony export */   listProjects: () => (/* binding */ listProjects),\n/* harmony export */   saveProject: () => (/* binding */ saveProject)\n/* harmony export */ });\nconst memoryStore = new Map();\nfunction listProjects() {\n    return Array.from(memoryStore.values()).sort((a, b)=>b.updatedAt.localeCompare(a.updatedAt));\n}\nfunction getProject(id) {\n    return memoryStore.get(id);\n}\nfunction saveProject(project) {\n    memoryStore.set(project.id, project);\n    return project;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3RvcmUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsTUFBTUEsY0FBYyxJQUFJQztBQUVqQixTQUFTQztJQUNkLE9BQU9DLE1BQU1DLElBQUksQ0FBQ0osWUFBWUssTUFBTSxJQUFJQyxJQUFJLENBQUMsQ0FBQ0MsR0FBR0MsSUFBTUEsRUFBRUMsU0FBUyxDQUFDQyxhQUFhLENBQUNILEVBQUVFLFNBQVM7QUFDOUY7QUFFTyxTQUFTRSxXQUFXQyxFQUFVO0lBQ25DLE9BQU9aLFlBQVlhLEdBQUcsQ0FBQ0Q7QUFDekI7QUFFTyxTQUFTRSxZQUFZQyxPQUFnQjtJQUMxQ2YsWUFBWWdCLEdBQUcsQ0FBQ0QsUUFBUUgsRUFBRSxFQUFFRztJQUM1QixPQUFPQTtBQUNUIiwic291cmNlcyI6WyIvVXNlcnMvcml4L0RvY3VtZW50cy9Qcm9ncmVtaW5lL0FnZW50cy9DVi9lc3Rvbmlhbi1qb2ItYWdlbnQvbGliL3N0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJvamVjdCB9IGZyb20gXCJAL3R5cGVzXCI7XG5cbmNvbnN0IG1lbW9yeVN0b3JlID0gbmV3IE1hcDxzdHJpbmcsIFByb2plY3Q+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0UHJvamVjdHMoKTogUHJvamVjdFtdIHtcbiAgcmV0dXJuIEFycmF5LmZyb20obWVtb3J5U3RvcmUudmFsdWVzKCkpLnNvcnQoKGEsIGIpID0+IGIudXBkYXRlZEF0LmxvY2FsZUNvbXBhcmUoYS51cGRhdGVkQXQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3QoaWQ6IHN0cmluZyk6IFByb2plY3QgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbWVtb3J5U3RvcmUuZ2V0KGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVQcm9qZWN0KHByb2plY3Q6IFByb2plY3QpOiBQcm9qZWN0IHtcbiAgbWVtb3J5U3RvcmUuc2V0KHByb2plY3QuaWQsIHByb2plY3QpO1xuICByZXR1cm4gcHJvamVjdDtcbn1cbiJdLCJuYW1lcyI6WyJtZW1vcnlTdG9yZSIsIk1hcCIsImxpc3RQcm9qZWN0cyIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsInNvcnQiLCJhIiwiYiIsInVwZGF0ZWRBdCIsImxvY2FsZUNvbXBhcmUiLCJnZXRQcm9qZWN0IiwiaWQiLCJnZXQiLCJzYXZlUHJvamVjdCIsInByb2plY3QiLCJzZXQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/store.ts\n");

/***/ }),

/***/ "(rsc)/./lib/utils.ts":
/*!**********************!*\
  !*** ./lib/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   makeId: () => (/* binding */ makeId)\n/* harmony export */ });\nfunction makeId(prefix) {\n    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvdXRpbHMudHMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPLFNBQVNBLE9BQU9DLE1BQWM7SUFDbkMsT0FBTyxHQUFHQSxPQUFPLENBQUMsRUFBRUMsS0FBS0MsTUFBTSxHQUFHQyxRQUFRLENBQUMsSUFBSUMsS0FBSyxDQUFDLEdBQUcsS0FBSztBQUMvRCIsInNvdXJjZXMiOlsiL1VzZXJzL3JpeC9Eb2N1bWVudHMvUHJvZ3JlbWluZS9BZ2VudHMvQ1YvZXN0b25pYW4tam9iLWFnZW50L2xpYi91dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbWFrZUlkKHByZWZpeDogc3RyaW5nKSB7XG4gIHJldHVybiBgJHtwcmVmaXh9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApfWA7XG59XG4iXSwibmFtZXMiOlsibWFrZUlkIiwicHJlZml4IiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/utils.ts\n");

/***/ }),

/***/ "(rsc)/./lib/validators/input.ts":
/*!*********************************!*\
  !*** ./lib/validators/input.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   projectInputSchema: () => (/* binding */ projectInputSchema),\n/* harmony export */   regenerateSectionSchema: () => (/* binding */ regenerateSectionSchema)\n/* harmony export */ });\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zod */ \"(rsc)/./node_modules/zod/v3/types.js\");\n\nconst projectInputSchema = zod__WEBPACK_IMPORTED_MODULE_0__.object({\n    title: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(2).max(120),\n    cvText: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(80, \"CV is too short\"),\n    jobAdText: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(80, \"Job ad is too short\")\n});\nconst regenerateSectionSchema = zod__WEBPACK_IMPORTED_MODULE_0__.object({\n    projectId: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(1),\n    section: zod__WEBPACK_IMPORTED_MODULE_0__[\"enum\"]([\n        \"analysis_summary_et\",\n        \"cv_et\",\n        \"motivation_letter_et\",\n        \"statement_short_et\",\n        \"statement_long_et\"\n    ]),\n    cvText: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(80),\n    jobAdText: zod__WEBPACK_IMPORTED_MODULE_0__.string().min(80)\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvdmFsaWRhdG9ycy9pbnB1dC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBd0I7QUFFakIsTUFBTUMscUJBQXFCRCx1Q0FBUSxDQUFDO0lBQ3pDRyxPQUFPSCx1Q0FBUSxHQUFHSyxHQUFHLENBQUMsR0FBR0MsR0FBRyxDQUFDO0lBQzdCQyxRQUFRUCx1Q0FBUSxHQUFHSyxHQUFHLENBQUMsSUFBSTtJQUMzQkcsV0FBV1IsdUNBQVEsR0FBR0ssR0FBRyxDQUFDLElBQUk7QUFDaEMsR0FBRztBQUVJLE1BQU1JLDBCQUEwQlQsdUNBQVEsQ0FBQztJQUM5Q1UsV0FBV1YsdUNBQVEsR0FBR0ssR0FBRyxDQUFDO0lBQzFCTSxTQUFTWCx3Q0FBTSxDQUFDO1FBQ2Q7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNEO0lBQ0RPLFFBQVFQLHVDQUFRLEdBQUdLLEdBQUcsQ0FBQztJQUN2QkcsV0FBV1IsdUNBQVEsR0FBR0ssR0FBRyxDQUFDO0FBQzVCLEdBQUciLCJzb3VyY2VzIjpbIi9Vc2Vycy9yaXgvRG9jdW1lbnRzL1Byb2dyZW1pbmUvQWdlbnRzL0NWL2VzdG9uaWFuLWpvYi1hZ2VudC9saWIvdmFsaWRhdG9ycy9pbnB1dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSBcInpvZFwiO1xuXG5leHBvcnQgY29uc3QgcHJvamVjdElucHV0U2NoZW1hID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5taW4oMikubWF4KDEyMCksXG4gIGN2VGV4dDogei5zdHJpbmcoKS5taW4oODAsIFwiQ1YgaXMgdG9vIHNob3J0XCIpLFxuICBqb2JBZFRleHQ6IHouc3RyaW5nKCkubWluKDgwLCBcIkpvYiBhZCBpcyB0b28gc2hvcnRcIiksXG59KTtcblxuZXhwb3J0IGNvbnN0IHJlZ2VuZXJhdGVTZWN0aW9uU2NoZW1hID0gei5vYmplY3Qoe1xuICBwcm9qZWN0SWQ6IHouc3RyaW5nKCkubWluKDEpLFxuICBzZWN0aW9uOiB6LmVudW0oW1xuICAgIFwiYW5hbHlzaXNfc3VtbWFyeV9ldFwiLFxuICAgIFwiY3ZfZXRcIixcbiAgICBcIm1vdGl2YXRpb25fbGV0dGVyX2V0XCIsXG4gICAgXCJzdGF0ZW1lbnRfc2hvcnRfZXRcIixcbiAgICBcInN0YXRlbWVudF9sb25nX2V0XCIsXG4gIF0pLFxuICBjdlRleHQ6IHouc3RyaW5nKCkubWluKDgwKSxcbiAgam9iQWRUZXh0OiB6LnN0cmluZygpLm1pbig4MCksXG59KTtcbiJdLCJuYW1lcyI6WyJ6IiwicHJvamVjdElucHV0U2NoZW1hIiwib2JqZWN0IiwidGl0bGUiLCJzdHJpbmciLCJtaW4iLCJtYXgiLCJjdlRleHQiLCJqb2JBZFRleHQiLCJyZWdlbmVyYXRlU2VjdGlvblNjaGVtYSIsInByb2plY3RJZCIsInNlY3Rpb24iLCJlbnVtIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/validators/input.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.ts&appDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.ts&appDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_rix_Documents_Progremine_Agents_CV_estonian_job_agent_app_api_projects_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/projects/route.ts */ \"(rsc)/./app/api/projects/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/projects/route\",\n        pathname: \"/api/projects\",\n        filename: \"route\",\n        bundlePath: \"app/api/projects/route\"\n    },\n    resolvedPagePath: \"/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/app/api/projects/route.ts\",\n    nextConfigOutput,\n    userland: _Users_rix_Documents_Progremine_Agents_CV_estonian_job_agent_app_api_projects_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZwcm9qZWN0cyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGcHJvamVjdHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZwcm9qZWN0cyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnJpeCUyRkRvY3VtZW50cyUyRlByb2dyZW1pbmUlMkZBZ2VudHMlMkZDViUyRmVzdG9uaWFuLWpvYi1hZ2VudCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZyaXglMkZEb2N1bWVudHMlMkZQcm9ncmVtaW5lJTJGQWdlbnRzJTJGQ1YlMkZlc3Rvbmlhbi1qb2ItYWdlbnQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ3NDO0FBQ25IO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvcml4L0RvY3VtZW50cy9Qcm9ncmVtaW5lL0FnZW50cy9DVi9lc3Rvbmlhbi1qb2ItYWdlbnQvYXBwL2FwaS9wcm9qZWN0cy9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcHJvamVjdHMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wcm9qZWN0c1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcHJvamVjdHMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvcml4L0RvY3VtZW50cy9Qcm9ncmVtaW5lL0FnZW50cy9DVi9lc3Rvbmlhbi1qb2ItYWdlbnQvYXBwL2FwaS9wcm9qZWN0cy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.ts&appDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/zod"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fprojects%2Froute&page=%2Fapi%2Fprojects%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fprojects%2Froute.ts&appDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Frix%2FDocuments%2FProgremine%2FAgents%2FCV%2Festonian-job-agent&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();