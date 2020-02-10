const fctUtil = require('factom/src/util');

class DataStoreBuilder {
    constructor(buffer) {

        //set up defaults
        this._namespace = [];

        this._buffer = buffer;
        this._size = buffer.length;

        //calculate the hash of the buffer for the 1st external ID
        this._bufferHash = fctUtil.sha256d(buffer);
    }

    compression(format) {

        //must be one of "zlib" or "gzip"

        //compress the buffer
        this._buffer = compress(this._buffer);

        //construct the compression object, including the length of the compressed buffer
        this._compression = {
            format,
            size: this._buffer.length
        }
    }

    namespace(name, encoding) {
        //validate encoding string if it is present

        this._namespace.push({name, encoding});
    }

    metadata(metadata) {
        this._metadata = metadata;
    }

    build() {
        //validate for buffer missing? (what does spec say?)

        return new DataStore(this);
    }
}

const {Entry, Chain} = require('factom');

class DataStore {
    constructor(builder) {
        if (!builder instanceof DataStoreBuilder) throw new TypeError('Constructor argument must be of type DataStoreBuilder');

        //pull in vars from builder to build chain first entry

        //calculate the Data Store Chain ID

        let firstEntry = Entry.builder()
            .extId(Buffer.from('data-store'))
            .extId(Buffer.from(fctUtil.sha256d(builder._buffer)));

        //handle namespaces in extids
        builder._namespace.forEach(function (ns) {
            firstEntry.extId(ns.name, ns.encoding);
        });

        firstEntry = firstEntry.build();

        const chainId = new Chain(firstEntry).chainIdHex;

        //Build up Data Block Entries
        const dataBlockEntries = [];

        //create a buffer out of the ordered data block entryhashes for the next step
        let hashBuffer = Buffer.from('');

        while (builder._buffer.length > 0) {
            const dbe = Entry.builder()
                .chainId(chainId)
                .content(builder._buffer.slice(0, 10240))
                .build();

            dataBlockEntries.push(dbe);
            hashBuffer = Buffer.concat(hashBuffer, Buffer.from(dbe.hashHex()));

            if (builder._buffer.length > 10240) builder._buffer = builder._buffer.slice(10240);
            else builder._buffer = buffer.from('');
        }

        //create Data Block Index Entries
        const dataBlockIndexEntries = [];

        while (hashBuffer.length > 0) {
            let hashes;

            if (hashBuffer.length > 10240) hashes = hashBuffer.slice(0, 10240);
            else hashes = hashBuffer;

            //construct the index entry
            const dbie = Entry.builder()
                .chainId(chainId)
                .content(hashes)
                .build();

            dataBlockIndexEntries.push(dbie);

            //go back one index entry if possible and set its extid to our entryhash to form the linked list
            if (dataBlockIndexEntries.length > 1) {

                dataBlockIndexEntries[dataBlockIndexEntries.length - 1] = Entry.builder(dataBlockIndexEntries[dataBlockIndexEntries.length - 1])
                    .extId(dbie.hashHex())
                    .build();
            }

            //slice down the buffer if there are remaining elements that were not covered
            if (hashBuffer.length > 10240) hashBuffer = hashBuffer.slice(10240);
            else hashBuffer = Buffer.from(''); //we are done otherwise
        }

        //Build up Data Store first chain entry object

        const firstEntryContent = {
            'data-store': '1.0',
            'size': builder._size,
            'dbi-start': dataBlockIndexEntries[0].hashHex()
        };

        firstEntry = Entry.builder(firstEntry)
            .content(firstEntryContent)
            .build();

        

    }
}