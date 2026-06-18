.PHONY: verify lint format build test verify-content verify-release

verify:
	@bash scripts/verify.sh

lint:
	@npm run lint

format:
	@npm run format

build:
	@npm run build

test:
	@npm run test

verify-content:
	@node scripts/verify-content.mjs

verify-release:
	@node scripts/verify-release.mjs
