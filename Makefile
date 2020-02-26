build: clean
	@echo "Installing dependencies..."
	yarn install

	@echo "Building files..."
	NODE_ENV=production yarn run build

package:
	@echo "Packaging the extension..."
	@cd build/; zip -r -FS ../phishdetect.zip .

clean:
	rm -rf build/
