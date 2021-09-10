build: clean
	@echo "Installing dependencies..."
	yarn install

	@echo "Building files..."
	NODE_ENV=production yarn run build --mode production

	@echo "Building CSS..."
	yarn tailwind -i src/css/phishdetect-ui.css -o build/css/phishdetect-ui.dist.css

package:
	@echo "Packaging the extension..."
	@cd build/; zip -r -FS ../phishdetect.zip .

lint:
	yarn eslint src/ --fix

clean:
	rm -rf build/
