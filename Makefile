.PHONY: verify lint format build test e2e verify-content verify-release audit-ui audit-products audit-food

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

e2e:
	@npm run e2e

audit-ui:
	@npm run audit:ui

audit-products:
	@npm run audit:products

audit-food:
	@npm run audit:food

verify-content:
	@node scripts/verify-content.mjs

verify-release:
	@node scripts/verify-release.mjs
