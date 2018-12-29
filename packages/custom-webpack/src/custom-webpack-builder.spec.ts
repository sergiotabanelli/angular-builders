import { MergeStrategies } from "./custom-webpack-builder-config";
jest.mock('./webpack-config-merger');
jest.mock('@ngtools/webpack');
import { CustomWebpackBuilder, defaultWebpackConfigPath } from "./custom-webpack-builder";
import * as fs from 'fs';
import { WebpackConfigMerger } from "./webpack-config-merger";
import { Path } from '@angular-devkit/core';
import { AngularCompilerPlugin } from '@ngtools/webpack';
import * as ts from 'typescript';
const transform0 = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
	return rootNode;
}

const transform1 = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
	return rootNode;
}

const transform2 = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
	return rootNode;
}

const angularCompilerPluginMock: jest.Mocked<AngularCompilerPlugin> = new AngularCompilerPlugin([transform1] as any) as any;

const baseWebpackConfig = {
	entry: 'blah'
};

const baseWebpackConfigWithPlugin = {
	entry: 'blah',
	plugins: [angularCompilerPluginMock]
};

const customWebpackConfig = {
	module: {
		rules: [
			{
				test: '.node',
				use: 'node-loader'
			}
		]
	}
};

const ngtsWebpackConfig = {
	module: {
		rules: [
			{
				test: '.node',
				use: 'node-loader'
			}
		]
	},
	ngts: {
		before: [transform0],
		after: [transform2]
	}
};

function createConfigFile(fileName: string, config: Object = customWebpackConfig) {
	jest.mock(`${__dirname}/${fileName}`, () => config, { virtual: true });
}

describe('CustomWebpackBuilder test', () => {
	let fileName: string;

	it('Should load webpack.config.js if no path specified', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should load the file specified in configuration', () => {
		fileName = 'extra-webpack.config.js';
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, { path: 'extra-webpack.config.js' }, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, undefined);
	});

	it('Should pass on merge strategies', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		const mergeStrategies: MergeStrategies = { 'blah': 'prepend' };
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, { mergeStrategies }, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, mergeStrategies, undefined);
	});

	it('Should pass on replaceDuplicatePlugins flag', () => {
		fileName = defaultWebpackConfigPath;
		createConfigFile(fileName);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, { replaceDuplicatePlugins: true }, baseWebpackConfig);
		expect(WebpackConfigMerger.merge).toHaveBeenCalledWith(baseWebpackConfig, customWebpackConfig, undefined, true);
	});

	it('Should add tranformers to angular and delete ngts', () => {
		const expected = [transform0, transform1, transform2];
		fileName = 'ngts-extra-webpack.config.js';
		createConfigFile(fileName, ngtsWebpackConfig);
		CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, { path: 'ngts-extra-webpack.config.js' }, baseWebpackConfigWithPlugin);
		expect(angularCompilerPluginMock['_transformers']).toEqual(expected);
	});

	it('Should delete ngts', () => {
		expect(ngtsWebpackConfig.ngts).toEqual(undefined);
	});
});