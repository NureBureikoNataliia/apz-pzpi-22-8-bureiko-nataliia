//Приклад виклику одного мікросервісу через gRPC (Java)
ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 50051)
                                              .usePlaintext()
                                              .build();

MusicServiceGrpc.MusicServiceBlockingStub stub = MusicServiceGrpc.newBlockingStub(channel);

PlayRequest request = PlayRequest.newBuilder().setTrackId("12345").build();
PlayResponse response = stub.playTrack(request);

System.out.println("Відтворюється: " + response.getStatus());
channel.shutdown();

