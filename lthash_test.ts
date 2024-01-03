import { hexToBytes, utf8ToBytes } from "npm:@noble/hashes/utils";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.91.0/testing/asserts.ts";
import { LtHash16 } from "./lthash.ts";

Deno.test("basic lthash", () => {
  const elements = ["apple", "banana", "kiwi"];
  const hash = LtHash16.default()
    .insert(utf8ToBytes(elements[0]))
    .insert(utf8ToBytes(elements[1]))
    .insert(utf8ToBytes(elements[2]))
    .remove(utf8ToBytes(elements[1]));
  const hashBis = LtHash16.default()
    .insert(utf8ToBytes(elements[0]))
    .insert(utf8ToBytes(elements[2]));

  assert(hash.equals(hashBis));
  assertEquals(hash.digest(), hashBis.digest());
  assertEquals(hash.digest().byteLength, 1024 * 2);
});

Deno.test("union lthash", () => {
  const left = LtHash16.default().insert(utf8ToBytes("hello"));

  const right = LtHash16.default().insert(
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

  assert(
    left.union(right).equals(
      LtHash16.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );

  assert(
    !left.union(right).equals(
      LtHash16.default().insert(
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("difference lthash", () => {
  const left = LtHash16.default().insert(
    utf8ToBytes("hello"),
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

  const right = LtHash16.default().insert(
    utf8ToBytes("world"),
    utf8ToBytes("lucas"),
  );

  assert(
    left.difference(right).equals(
      LtHash16.default().insert(
        utf8ToBytes("hello"),
      ),
    ),
  );

  assert(
    !left.difference(right).equals(
      LtHash16.default().insert(
        utf8ToBytes("hello"),
        utf8ToBytes("world"),
        utf8ToBytes("lucas"),
      ),
    ),
  );
});

Deno.test("interoperability lthash", () => {
  const hash = LtHash16.default()
    .insert(utf8ToBytes("hello"))
    .insert(utf8ToBytes("world"));
  const observed = hash.digest();
  // This matches with a rust implementation
  const expected = hexToBytes(
    "c5ad8fd1aef368922d10bf215ae697f0701171a58084602f1aa5a3b2422a2059291316a8743102c5c63b4ea23a2bd4f6e2a380aabfd4fff88129d2ef0f13b60b7e2f53980cafd6bcb9a2f126e57333cec0b2991a8a24fe43e03e1c101b0755f3ca26a943442b0c5cba25b4d8c5c160c9eab7bfda6c8b7552eb598881d9bfbb519d49e918c471da6596fe56828a6d1993e3481815d1d6202695911b76258e0a87b121db5b4b356979fed48a5889e6f4740b9c9d5740660881c4f1981ecd679474a3542d0b9609a4aa825a951995e2a7470c44e9f6c9a0754d6704f7cc91b9d8ac43e376a69f4a956e5e3f759d8bf809412466d48a9d9c32a359b003c4c6cef62c9aeac025117a63ec53c799c3de8fcf9b45bc1be2e30bf92174d85ab4a24b915cd0b4e1b9c3d09d84b813703faa77ccb79949a6d3cb03ccf0185a95d9daf580a3188e5e5c39162fb40224f4d1d7a1c0aec1aa1255a8244153f81239c9a17acbab211184a31f7d1d0b19403f42c4a87bab016cd62affdd36a24024895944dc45e7d01cf65329b7927a26d2e2c36b60916ff23fc121114eb4729a2dc4a833366f063ff84c0599f8f400fc1fe82c2f31d08c453b401ac32e494ea50a0a6b1dc5ba6a7e61d1e4ddcd76884cc5a2c25a3d5659dc08d4f11b1d57741ff5994282c769a0abea4ed9a5fddf468f5a96a53b0ab7552492e63164c34b9f576c96ae6a7781f968868d3d67a3c4872986c3998b1ab7c4d0547e6eaf2442f11fd8648d24c4a497c712805a53c2233ca340722fb585d12bc4a3f12b629d4794210dce895b036082f4c8a1f3842da627b8293dade62312b93cc97384c75273fb336d9c96fffb638483b9e04b40762dcbace19d6f1ecb778a1a118244f764d3100b136c4556dcfd404273b410c20ae9b6a6d78f38be9bfc65703f80be7b09425a76656e7fb5dbf1a8a6d8d1296b6637e5456a25fec18677cb7443097596d67ebce22e57d74031cdea76fb7e67db21e238a430d3d1df9d77f4dcc065153c13f1d92f891ee3a31aa2075347a49ce90057088081c414a72bb084621a347e55fdac81d8dcb827b6142c547fdcb987905abd38798b75fda7f5e2a8fc170e69fe982dee21979c56de3fb1750f26e20f805fcc4c7d130308b1f9faece90b33fd0366f212ee87b55754176b4a759e4baddfcc6cd93837f881d653266eac6d2c092d683d8758e00ac4f9100a3c7f43096c6ab4e5582df550e3d827d4850d30c84deeeafb6cc1519067f9c42108f72fe19c7107e5a296a16209b338e5700a8c65a073eb69954d466c10593b8cde13d1f3adbe5649cf5de5041fa05b3c156d490604f2462bafb5cb8b4cc824232bc5239a0c12b52d56ece4b4048ad41413e3a0a1bc4346a3964db67ee1946e822323483d5bc1666a5d00e305642b0f0bc439f0cd9f23180f8a2e3e14122cfb04d429cae855173873250e200ee1545dc424a5f48224b9f28bdabf00ab362375d9c378903fdb0d4b3d19e8b99abfa5a4d1ad264130ed45a024eb42acaaa9590589777eba754dbc8397ff986713d931f463def4cb4ed9131620f7e375fe2f076e751f400cf899f32d555d4f24573dccb393e814515d341b300e0ceecffa214c6a50e8a082cb1872eb0e0f7dafefaf20097d3a31820dc5fc4afa5f71e1a1dbc2f5fcb1703ce217dcd3e0d70ca9bf01df99c2fbc4f7f2301a547182678bdf193b6dcb0e1e2597c3fe1c753f662db798229d9d4dc5475a6394ee3bd3bea4cf41521cf24eca191836aa8d1bdb751e977357217e245ce5018b23dabef52baedf5c520b82d06880a71403259d3c088c454a358da823b4d7fac9fc8459b3454f89a328937398817a39268e56295e9ee946628a94946dd77d7ebeba8ef8e6fcf70b763161abf351d9319ef3c8301d0f144d230c077643f0a58e1bce99ef5126ae61f4647c12dda00d1fbe914c33d1a4095b76f04d2f7ae9a114a3a5405f1cb0177f18a07774dc4c532efb49eae2e06a603d5591f2da15cd103314d3af4697ba177dcf959bcbc058a078a72930dacab3c7eca43ef0e267dd7552cb09f977b98b92477ede5ed34e8f074cb8fbbd6f27d74491dac7efd4f707726205bdbeba78375c0ff4a67d32cc84bcf9df7dd076b2e6e78c5828d0c8ff1caac28e96f5dda5d378c9cd49ebc6e5313236615ca48be743247356e137780103a24efde3f0d1e102510c13e7310945ad7188f18d8514fedad8354e7f3e39c13902732e9e4474b0346acad55ee1e98c0bb27fc3191e46140488ca2738ef6146bdce6646539b3680ec644767ae5c5036f2d07a63dddf8f7b37046fdc4d52e4fec66e4f88131b35fb388df867d305294eb6242acb5bb504bbbd1f9c870389f5a573cb727a66a79d986b946faa32ec3e67054be5cfad20cdac16a32aaa60cb6dd895f77e9e0495b680b0c54e376e37ddbcef41b2c6e42c1d2f1e6ab33d4d728b5decec0b29f766c393d7c4abc0f3bf03d5a8f3a29c91dde8474d5fb7c276b68aae87067c5cd1290c019c1cc6c21a16a87282c93cea9315025775687a1e8b1a6d8cf288146032b222f5fe6b8b6e07701a7173c184216d976345d86323a812e8341a15437694a92c58ba640faa6d9144a4b7201598685d8159420e5b3f076bea3fc94a22431b5bd3b90d6ed1601175225b816bcb67af6c2b427cb08ee4e4e085cea45aba2dbfe23044017efca454c445a0107725ebecbf7e19cfc398bdba679c99993712ca1089e1e69807323fb80e6400a0e8aa466560bca41543c68d1810560c694d074f468325f8584a0c9faab434c92ed446bc0880a7e0078188d44ff62e7670db664187ab3d38ed23d1b7e6b8b1921f575fbaf14deddafa99618b69b7cab471d4eabe1b5c4b742f88f6fd89dcc99cb1",
  );
  assertEquals(observed, expected);
});
