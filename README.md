# ngx-translate-lookup

Using [ngx-translate](http://www.ngx-translate.com/) your html will have references to keys being passed through the translate service. It can be hard to know what these translate to and if there are any missing strings until runtime.

## Features

This extension will read a .resx or .json file and then provide intellisense and code completion displaying available keys and values. It will also provide problem reporting of values that do not exist in the resources file.

### Code Completion

![code completion image](screenshots/intellisense.png)

### Missing value warnings

![missing values image](screenshots/problems.png)

### Hover information

![hover info image](screenshots/hover.png)

## Extension Settings

This extension contributes the following settings:

- 'ngx-translate.lookup.resourcesType': Type of resource file, either .resx or .json.
  - If json then the format should be:
  ```
  {
    "STRING1" : "This is the first",
    "STRING2" : "This is the second"
  }
  ```
- `ngx-translate.lookup.resourcesPath`: Path to a resources file (.resx or.json) file for lookups.
- `ngx-translate.lookup.regex`: Regular expressions used to locate translation string/keys within documents.
  These default to find usages of 'translate="KEY"' and '{{'KEY' | translate}}'
