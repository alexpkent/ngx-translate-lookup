"use strict";
import * as vscode from 'vscode';

import { createCompletionItemProvider } from './completionItemProvider';
import { createHighlightProvider } from './highlightProvider';
import { createHoverProvider } from './hoverProvider';

const resx2js = require("resx/resx2js");
const fs = require("fs");
const path = require("path");

var output = vscode.window.createOutputChannel("ngx-translate-lookup");

export class ResourceDictionary {
  private constructor() { }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  private _resources: vscode.CompletionItem[] = [];
  private static _instance: ResourceDictionary;

  public setResources(resources: vscode.CompletionItem[]) {
    this._resources = resources;
  }

  public getResources(): vscode.CompletionItem[] {
    return this._resources;
  }
}

export function readResourceConfig() {
  const config = vscode.workspace.getConfiguration();
  const resourcesPaths = config.get<string[]>("ngx-translate.lookup.resourcesPaths") || [];

  const resourcesPath = config.get<string>(
    "ngx-translate.lookup.resourcesPath"
  );

  if (resourcesPath) {
    resourcesPaths.push(resourcesPath);
  }

  if (resourcesPaths.length < 1) {
    output.appendLine("No resources paths found in config; Set `ngx-translate.lookup.resourcesPaths` or `ngx-translate.lookup.resourcesPath`");
    return;
  }

  const resourcesType = config.get(
    "ngx-translate.lookup.resourcesType"
  ) as string;

  output.appendLine(
    `Resources config type: '${resourcesType}', paths: '${resourcesPaths}'`
  );

  return {
    resourcesPaths,
    resourcesType
  };
}

export function activate(context: vscode.ExtensionContext) {
  output.show(true);

  const config = readResourceConfig();

  if (!config) {
    output.appendLine("No resources config found.");
    return;
  }

  try {
    loadResources(config.resourcesPaths, config.resourcesType)
      .then(dictionary => {
        ResourceDictionary.Instance.setResources(dictionary);

        output.appendLine(
          `ngx-translate-lookup resource dictionary loaded from ${
          config.resourcesPaths
          }`
        );

        context.subscriptions.push(
          vscode.languages.registerCompletionItemProvider(
            "html",
            createCompletionItemProvider(),
            '"',
            "'"
          )
        );
        context.subscriptions.push(
          vscode.languages.registerHoverProvider("html", createHoverProvider())
        );
        createHighlightProvider(context);
      })
      .catch(() => {
        output.appendLine(
          "Error when reading resource file, please check your ngx-translate.lookup.resourcesPath and type setting."
        );
      });
  } catch (error) {
    output.appendLine(error);
  }

  let reloadCommand = vscode.commands.registerCommand(
    "ngx-translate-lookup.reload",
    () => {
      const config = readResourceConfig();
      if (!config) {
        output.appendLine("No resources config found.");
        return;
      }

      loadResources(config.resourcesPaths, config.resourcesType)
        .then(dictionary => {
          ResourceDictionary.Instance.setResources(dictionary);

          output.appendLine(
            `ngx-translate-lookup resource dictionary reloaded from ${
            config.resourcesPaths
            }`
          );
        })
        .catch(() => {
          output.appendLine(
            "Error when reading resource file, please check your `ngx-translate.lookup.resourcesPaths` and `ngx-translate.lookup.type` setting."
          );
        });
    }
  );
  context.subscriptions.push(reloadCommand);
}

export function loadResources(
  resourcesPaths: string[],
  resourcesType: string
): Promise<vscode.CompletionItem[]> {
  return Promise.all(resourcesPaths.map(path => loadResource(path, resourcesType)))
    .then(dictionaries => ([] as vscode.CompletionItem[]).concat(...dictionaries));
}

export function loadResource(
  resourcesPath: string,
  resourcesType: string
): Promise<vscode.CompletionItem[]> {
  let resourceDictionary: vscode.CompletionItem[] = [];

  return new Promise((resolve, reject) => {
    var fileExt = resourcesPath.split(".").pop();
    if (fileExt !== resourcesType) {
      output.appendLine(
        "Resources type doesnt match the resources path file type"
      );
      reject();
    }

    if (!path.isAbsolute(resourcesPath)) {
      output.appendLine("Resources path is relative");

      if (!vscode.workspace.workspaceFolders) {
        output.appendLine("Workspace folder required for relative path usage");
        reject();
      } else {
        resourcesPath = path.resolve(
          vscode.workspace.workspaceFolders[0].uri.fsPath,
          resourcesPath
        );
        output.appendLine("Relative path resolved to " + resourcesPath);
      }
    }

    fs.readFile(resourcesPath, "utf8", function read(err: any, text: string) {
      if (err) {
        reject(err);
      }

      if (resourcesType === "resx") {
        resx2js(text, (err: string, resources: any) => {
          for (const key in resources) {
            if (resources.hasOwnProperty(key)) {
              const item = resources[key];
              resourceDictionary.push({
                label: `ngx-translate: ${key}`,
                detail: item,
                insertText: key,
                kind: vscode.CompletionItemKind.Text
              });
            }
          }
        });
      }

      if (resourcesType === "json") {
        const resources = JSON.parse(text);
        readJson(resourceDictionary, resources);
      }

      resolve(resourceDictionary);
    });
  });
}

export function readJson(dictionary: any, resources: any, parentKey?: string) {
  Object.keys(resources).forEach(function (key) {

    const keyText = parentKey ? `${parentKey}.${key}` : key;

    if (typeof resources[key] === 'object') {
      readJson(dictionary, resources[key], keyText);
    } else {
      dictionary.push({
        label: `ngx-translate: ${keyText}`,
        detail: resources[key],
        insertText: keyText,
        kind: vscode.CompletionItemKind.Text
      });
    }
  });
}

export function deactivate() { }
