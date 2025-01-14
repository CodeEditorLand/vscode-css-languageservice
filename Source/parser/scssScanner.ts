/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

import { IToken, Scanner, TokenType } from "./cssScanner";

const _FSL = "/".charCodeAt(0);

const _NWL = "\n".charCodeAt(0);

const _CAR = "\r".charCodeAt(0);

const _LFD = "\f".charCodeAt(0);

const _DLR = "$".charCodeAt(0);

const _HSH = "#".charCodeAt(0);

const _CUL = "{".charCodeAt(0);

const _EQS = "=".charCodeAt(0);

const _BNG = "!".charCodeAt(0);

const _LAN = "<".charCodeAt(0);

const _RAN = ">".charCodeAt(0);

const _DOT = ".".charCodeAt(0);

const _ATS = "@".charCodeAt(0);

let customTokenValue = TokenType.CustomToken;

export const VariableName = customTokenValue++;

export const InterpolationFunction: TokenType = customTokenValue++;

export const Default: TokenType = customTokenValue++;

export const EqualsOperator: TokenType = customTokenValue++;

export const NotEqualsOperator: TokenType = customTokenValue++;

export const GreaterEqualsOperator: TokenType = customTokenValue++;

export const SmallerEqualsOperator: TokenType = customTokenValue++;

export const Ellipsis: TokenType = customTokenValue++;

export const Module: TokenType = customTokenValue++;

export class SCSSScanner extends Scanner {
	protected scanNext(offset: number): IToken {
		// scss variable
		if (this.stream.advanceIfChar(_DLR)) {
			const content = ["$"];

			if (this.ident(content)) {
				return this.finishToken(offset, VariableName, content.join(""));
			} else {
				this.stream.goBackTo(offset);
			}
		}

		// scss: interpolation function #{..})
		if (this.stream.advanceIfChars([_HSH, _CUL])) {
			return this.finishToken(offset, InterpolationFunction);
		}

		// operator ==
		if (this.stream.advanceIfChars([_EQS, _EQS])) {
			return this.finishToken(offset, EqualsOperator);
		}

		// operator !=
		if (this.stream.advanceIfChars([_BNG, _EQS])) {
			return this.finishToken(offset, NotEqualsOperator);
		}

		// operators <, <=
		if (this.stream.advanceIfChar(_LAN)) {
			if (this.stream.advanceIfChar(_EQS)) {
				return this.finishToken(offset, SmallerEqualsOperator);
			}

			return this.finishToken(offset, TokenType.Delim);
		}

		// ooperators >, >=
		if (this.stream.advanceIfChar(_RAN)) {
			if (this.stream.advanceIfChar(_EQS)) {
				return this.finishToken(offset, GreaterEqualsOperator);
			}

			return this.finishToken(offset, TokenType.Delim);
		}

		// ellipis
		if (this.stream.advanceIfChars([_DOT, _DOT, _DOT])) {
			return this.finishToken(offset, Ellipsis);
		}

		return super.scanNext(offset);
	}

	protected comment(): boolean {
		if (super.comment()) {
			return true;
		}

		if (!this.inURL && this.stream.advanceIfChars([_FSL, _FSL])) {
			this.stream.advanceWhileChar((ch: number) => {
				switch (ch) {
					case _NWL:
					case _CAR:
					case _LFD:
						return false;

					default:
						return true;
				}
			});

			return true;
		} else {
			return false;
		}
	}
}
