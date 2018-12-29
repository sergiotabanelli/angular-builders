import { CustomWebpackBuilderConfig } from "./custom-webpack-builder-config";
import { Configuration } from "webpack";
import { getSystemPath, Path } from '@angular-devkit/core';
import { WebpackConfigMerger } from "./webpack-config-merger";
import { AngularCompilerPlugin } from "@ngtools/webpack"
import * as ts from "typescript";

export const defaultWebpackConfigPath = 'webpack.config.js';

export class CustomWebpackBuilder {
	static buildWebpackConfig(root: Path, config: CustomWebpackBuilderConfig, baseWebpackConfig: Configuration): Configuration {
//		console.log("Building custom webpack config!!!");
		const webpackConfigPath = config.path || defaultWebpackConfigPath;
		const customWebpackConfig = require(`${getSystemPath(root)}/${webpackConfigPath}`);
		let plugins = baseWebpackConfig.plugins;
		if (plugins && customWebpackConfig.ngts) {
			plugins.forEach((plugin, index, plugins) => {
				if (plugin instanceof AngularCompilerPlugin) {
					let tranformers = plugin['_transformers'] as ts.TransformerFactory<ts.SourceFile>[];
					if (customWebpackConfig.ngts.after) {
						let pt = customWebpackConfig.ngts.after as ts.TransformerFactory<ts.SourceFile>[];
						tranformers.push(...pt);
					}
					if (customWebpackConfig.ngts.before) {
						let ut = customWebpackConfig.ngts.before as ts.TransformerFactory<ts.SourceFile>[];
						tranformers.unshift(...ut);
					}
				}
			})
			delete customWebpackConfig['ngts'];
		}
		return WebpackConfigMerger.merge(baseWebpackConfig, customWebpackConfig, config.mergeStrategies, config.replaceDuplicatePlugins);
	}
}