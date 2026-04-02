VERSION = 0.1.2
BANNER = /*! Grain UI v$(VERSION) | MIT License | https://github.com/rachanpadmanabha/grain-ui */

SRC_CSS = src/tokens.css src/base.css \
	src/components/button.css \
	src/components/form.css \
	src/components/card.css \
	src/components/badge.css \
	src/components/table.css \
	src/components/alert.css \
	src/components/modal.css \
	src/components/tabs.css \
	src/components/tooltip.css \
	src/components/progress.css \
	src/components/spinner.css \
	src/components/avatar.css \
	src/components/dropdown.css \
	src/components/nav.css

SRC_JS = src/index.js \
	src/components/web-components/grain-tabs.js \
	src/components/web-components/grain-toast.js \
	src/components/web-components/grain-modal.js \
	src/components/web-components/grain-dropdown.js

all: dist/grain.css dist/grain.min.css dist/grain.js dist/grain.min.js
	rm -f dist/.grain.raw.css

dist:
	mkdir -p dist

dist/.grain.raw.css: $(SRC_CSS) | dist
	cat $(SRC_CSS) > $@

dist/grain.css: dist/.grain.raw.css | dist
	printf '%s\n' '$(BANNER)' > $@
	cat $< >> $@

dist/grain.min.css: dist/.grain.raw.css | dist
	npx lightningcss --minify $< -o dist/.grain.min.css
	printf '%s\n' '$(BANNER)' > $@
	cat dist/.grain.min.css >> $@
	rm -f dist/.grain.min.css

dist/grain.js: $(SRC_JS) | dist
	npx esbuild src/index.js --bundle --format=iife --global-name=GrainUI --target=es2020 --outfile=dist/.grain.js
	printf '%s\n' '$(BANNER)' > $@
	cat dist/.grain.js >> $@
	rm -f dist/.grain.js

dist/grain.min.js: $(SRC_JS) | dist
	npx esbuild src/index.js --bundle --format=iife --global-name=GrainUI --target=es2020 --minify --outfile=dist/.grain.min.js
	printf '%s\n' '$(BANNER)' > $@
	cat dist/.grain.min.js >> $@
	rm -f dist/.grain.min.js

clean:
	rm -f dist/grain.css dist/grain.min.css dist/grain.js dist/grain.min.js dist/.grain.raw.css

.PHONY: all clean
