styles:
	@echo "Building CSS for embedded pages..."
	node_modules/.bin/tailwind build -o pages/css/dist.css pages/css/build.css

build:
	@echo "Installing dependencies..."
	npm install

	@echo "Building CSS for embedded pages..."
	node_modules/.bin/tailwind build -o pages/css/dist.css pages/css/build.css

	@echo "Building files..."
	npm run build

package:
	@echo "Packaging the extension..."
	@zip -r -FS phishdetect.zip css/ dist/ img/ js/ options/ pages/ popup/ manifest.json

clean:
	rm -rf dist/
