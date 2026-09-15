import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

export interface BlockchainTx {
  transactionHash: string;
  blockNumber: number;
}

// Fabric chaincode replaces this — see infrastructure/hyperledger-fabric
@Injectable()
export class BlockchainService {
  registerProduct(): BlockchainTx {
    return this.record(1);
  }

  addEvent(): BlockchainTx {
    return this.record(1);
  }

  private record(_count: number): BlockchainTx {
    return {
      transactionHash: 'local-' + crypto.randomUUID().slice(0, 8),
      blockNumber: 0,
    };
  }
}