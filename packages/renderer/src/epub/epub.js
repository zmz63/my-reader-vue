import Book from "./book";
import Rendition from "./rendition";
import CFI from "./epubcfi";
import Contents from "./contents";
import * as utils from "./utils/core";
import { EPUBJS_VERSION } from "./utils/constants";

import IframeView from "./managers/views/iframe";
import DefaultViewManager from "./managers/default";
import ContinuousViewManager from "./managers/continuous";


function ePub(url, options) {
	return new Book(url, options);
}

ePub.VERSION = EPUBJS_VERSION;

if (typeof(global) !== "undefined") {
	global.EPUBJS_VERSION = EPUBJS_VERSION;
}

ePub.Book = Book;
ePub.Rendition = Rendition;
ePub.Contents = Contents;
ePub.CFI = CFI;
ePub.utils = utils;

export default ePub;
