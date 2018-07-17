# ngx-translate-lookup

Using [ngx-translate](http://www.ngx-translate.com/) your html will have references to keys being passed through the translate service. It can be hard to know what these translate to and if there are any missing strings until runtime.

## Features

This extension will read a resources.resx file and then provide intellisense and code completion displaying available keys and values. It will also provide highlighting of values that do not exist in the resx file.

## Extension Settings

This extension contributes the following settings:

- `ngx-translate.lookup.resourcesPath`: Path to a resources.resx file for lookups.
- `ngx-translate.lookup.regex`: Regular expressions used to locate translation string/keys within documents.
  These default to find usages of 'translate="KEY"' and '{{'KEY' | translate}}'
