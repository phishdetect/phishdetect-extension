build: clean
	@echo "Installing dependencies..."
	npm install

	@echo "Building files..."
	NODE_ENV=production npm run build

package:
	@echo "Packaging the extension..."
	@zip -r -FS phishdetect.zip build/*

clean:
	rm -rf build/
