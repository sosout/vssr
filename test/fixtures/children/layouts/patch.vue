<template>
  <div>
    <vssr />
    <ul>
      <li><vssr-link data-test-id="patch" to="/patch">/patch</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-1" to="/patch/1">/patch/1</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-2" to="/patch/2">/patch/2</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-2" to="/patch/2#test">/patch/2#test</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-child" to="/patch/2/child">/patch/2/child</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-2-child-1" to="/patch/2/child/1">/patch/2/child/1</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-2-child-1" to="/patch/2/child/1?query=true">/patch/2/child/1?query=true</vssr-link></li>
      <li><vssr-link data-test-id="patch-id-2-child-1" to="/patch/2/child/1?query=true#test">/patch/2/child/1?query=true#test</vssr-link></li>
    </ul>
  </div>
</template>
