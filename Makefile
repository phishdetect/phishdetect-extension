build: clean
	@echo "Installing dependencies..."
	npm install

	@echo "Building files..."
	npm run build

package:
	@echo "Packaging the extension..."
	@zip -r -FS phishdetect.zip css/ dist/ fontawesome/ icons/ js/ lib/ ui/ manifest.json

clean:
	rm -rf dist/
