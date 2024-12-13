// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
// } from "react-native";
// import { fetchAllProductsCollection } from "../api/shopifyApi";
// import { useCart } from "../context/CartContext"; // Import CartContext

// const ProductsScreen = ({ route }) => {
//   const { collectionId, title } = route.params;
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // Use the CartContext
//   const { addItemToCart } = useCart();

//   useEffect(() => {
//     const getProducts = async () => {
//       try {
//         const data = await fetchAllProductsCollection(collectionId);
//         setProducts(data.products.edges.map((edge) => edge.node));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getProducts();
//   }, [collectionId]);

//   const openModal = (product) => {
//     setSelectedProduct(product);
//     setModalVisible(true);
//     console.log(product.variants.edges[0].node.price.amount);
//   };

//   const closeModal = () => {
//     setSelectedProduct(null);
//     setModalVisible(false);
//   };

//   const handleAddToCart = async () => {
//     if (selectedProduct?.variants?.edges?.[0]?.node?.id) {
//       const variantId = selectedProduct.variants.edges[0].node.id;
//       try {
//         console.log("Adding item to cart with variant ID:", variantId);
//         await addItemToCart(variantId, 1);
//         alert("Added to cart!");
//       } catch (error) {
//         console.error("Error handling add to cart:", error);
//       } finally {
//         closeModal();
//       }
//     } else {
//       console.error("No variant ID available for the selected product.");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading products...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>{title}</Text>
//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.productContainer}
//             onPress={() => openModal(item)}
//           >
//             <Image
//               source={{
//                 uri:
//                   item.images.edges[0]?.node.src ||
//                   "https://via.placeholder.com/100",
//               }}
//               style={styles.image}
//             />
//             <Text style={styles.title}>{item.title}</Text>
//             <Text>{item.description || "No description available."}</Text>
//           </TouchableOpacity>
//         )}
//       />

//       {/* Modal for Product Details */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalContainer}>
//           {/* Close Button */}
//           <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
//             <Text style={styles.closeButtonText}>×</Text>
//           </TouchableOpacity>

//           <ScrollView style={styles.modalContent}>
//             {selectedProduct && (
//               <>
//                 {/* Product Image */}
//                 <Image
//                   source={{
//                     uri:
//                       selectedProduct.images.edges[0]?.node.src ||
//                       "https://via.placeholder.com/300",
//                   }}
//                   style={styles.modalImage}
//                 />

//                 {/* Product Title */}
//                 <Text style={styles.modalTitle}>
//                   {selectedProduct.title || "No Title Available"}
//                 </Text>

//                 {/* Product Price */}
//                 <View
//                   style={{ display: "flex", flexDirection: "row", gap: "20" }}
//                 >
//                   <Text style={styles.modalPrice}>
//                     $
//                     {selectedProduct.variants.edges[0].node.price.amount ||
//                       "N/A"}
//                   </Text>
// {selectedProduct.variants.edges[0].node.compareAtPrice ? (
//   <Text style={styles.modalComparePrice}>
//     $
//     {
//       selectedProduct.variants.edges[0].node.compareAtPrice
//         .amount
//     }
//   </Text>
// ) : null}
//                 </View>
//                 {/* Product Description */}
//                 <Text style={styles.modalDescription}>
//                   {selectedProduct.description || "No description available."}
//                 </Text>

//                 {/* Add to Cart Button */}
//                 <View style={styles.buttonContainer}>
//                   <TouchableOpacity
//                     style={styles.addToCartButton}
//                     onPress={handleAddToCart}
//                   >
//                     <Text style={styles.buttonText}>Add to Cart</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </ScrollView>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   productContainer: {
//     margin: 10,
//     padding: 10,
//     borderRadius: 8,
//     backgroundColor: "#f9f9f9",
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 100,
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     width: "90%",
//   },
//   modalImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 10,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginVertical: 10,
//   },
//   modalPrice: {
//     fontSize: 16,
//     color: "red",
//     marginBottom: 10,
//   },
//   modalComparePrice: {
//     fontSize: 16,
//     color: "grey",
//     marginBottom: 10,
//     textDecorationLine: "line-through",
//   },
//   modalDescription: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     marginTop: 10,
//   },
//   addToCartButton: {
//     backgroundColor: "#ff5a5f",
//     padding: 15,
//     borderRadius: 5,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     zIndex: 10,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     borderRadius: 20,
//     width: 30,
//     height: 30,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeButtonText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default ProductsScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { fetchAllProductsCollection } from "../api/shopifyApi";

const ProductsScreen = ({ route, navigation }) => {
  const { collectionId, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProductsCollection(collectionId);
        setProducts(data.products.edges.map((edge) => edge.node));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [collectionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productContainer}
            onPress={() => navigation.navigate("Product", { product: item })}
          >
            <Image
              source={{
                uri:
                  item.images.edges[0]?.node.src ||
                  "https://via.placeholder.com/100",
              }}
              style={styles.image}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>
              {item.description || "No description available."}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  productContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default ProductsScreen;
