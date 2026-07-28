# Grain UI build.
#
# package.json is the single source of truth for the version and for the
# browser targets, so nothing here needs bumping at release time.

VERSION := $(shell node -p "require('./package.json').version")
BANNER  := /*! Grain UI v$(VERSION) | MIT License | https://github.com/rachanpadmanabha/grain-ui */

BIN     := ./node_modules/.bin
CSS_IN  := src/grain.css
# Two JS entries: a global-assigning IIFE for <script> tags, and the ESM
# module bundlers should resolve.
IIFE_IN := src/iife.js
ESM_IN  := src/index.js

CSS_SRC := $(shell find src -name '*.css')
JS_SRC  := $(shell find src -name '*.js')

ESBUILD_FLAGS := --bundle --target=es2020
LIGHTNING_FLAGS := --bundle --browserslist

OUT := dist/grain.css dist/grain.min.css \
	dist/grain.js dist/grain.min.js \
	dist/grain.esm.js dist/grain.d.ts

all: $(OUT)

dist:
	@mkdir -p dist

# `banner` prepends the license header without a temp file in the tree.
define banner
	@printf '%s\n' '$(BANNER)' | cat - $(1) > $(1).tmp && mv $(1).tmp $(1)
endef

dist/grain.css: $(CSS_SRC) package.json | dist
	$(BIN)/lightningcss $(LIGHTNING_FLAGS) $(CSS_IN) -o $@
	$(call banner,$@)

dist/grain.min.css: $(CSS_SRC) package.json | dist
	$(BIN)/lightningcss $(LIGHTNING_FLAGS) --minify $(CSS_IN) -o $@
	$(call banner,$@)

dist/grain.js: $(JS_SRC) package.json | dist
	$(BIN)/esbuild $(IIFE_IN) $(ESBUILD_FLAGS) --format=iife --outfile=$@
	$(call banner,$@)

dist/grain.min.js: $(JS_SRC) package.json | dist
	$(BIN)/esbuild $(IIFE_IN) $(ESBUILD_FLAGS) --format=iife --minify --outfile=$@
	$(call banner,$@)

dist/grain.esm.js: $(JS_SRC) package.json | dist
	$(BIN)/esbuild $(ESM_IN) $(ESBUILD_FLAGS) --format=esm --outfile=$@
	$(call banner,$@)

dist/grain.d.ts: src/grain.d.ts | dist
	@cp $< $@

# The docs site loads the build from docs/dist so local edits are visible
# without publishing. Regenerated on every build; not tracked in git.
docs: all
	@rm -rf docs/dist
	@mkdir -p docs/dist
	@cp dist/grain.min.css dist/grain.min.js docs/dist/

clean:
	rm -rf dist docs/dist

.PHONY: all clean docs
