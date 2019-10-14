build: clean
	@echo "Installing dependencies..."
	npm install

	@echo "Building files..."
	NODE_ENV=production npm run build

package:
	@echo "Packaging the extension..."
	@cd build/; zip -r -FS ../phishdetect.zip .

clean:
	rm -rf build/
